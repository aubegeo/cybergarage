---
title: "Java Virtual Threads : comprendre le thread-per-request qui passe (enfin) à l'échelle"
category: dev-info
date: 2026-06-28
author: Geoffrey Aubert
tags: ["java", "concurrence", "virtual-threads", "performance", "jep-444"]
summary: "Les virtual threads, finalisés dans Java 21 (JEP 444), rendent le style thread-per-request de nouveau viable à grande échelle. Ce que dit la source officielle : à quoi ils servent, le piège du pinning, et pourquoi il ne faut surtout pas les pooler."
readTime: 8
---

# Java Virtual Threads : le thread-per-request qui passe (enfin) à l'échelle

Pendant des années, écrire du code serveur simple — un thread par requête — se heurtait à un mur : les threads de la JVM sont des threads du système d'exploitation, coûteux et limités en nombre. Pour tenir la charge, on basculait vers du code asynchrone (callbacks, `CompletableFuture`, réactif), plus performant mais nettement plus dur à écrire, déboguer et profiler.

Les **virtual threads**, finalisés dans **Java 21** par le [JEP 444](https://openjdk.org/jeps/444), changent la donne. Cet article s'appuie directement sur ce texte officiel. Résumé de la source : *« Introduce virtual threads to the Java Platform. Virtual threads are lightweight threads that dramatically reduce the effort of writing, maintaining, and observing high-throughput concurrent applications. »*

## L'idée : des threads « presque gratuits »

Un virtual thread est un thread léger géré par la JVM, pas par l'OS. Le JEP le formule ainsi : pour le développeur, *« virtual threads are simply threads that are cheap to create and almost infinitely plentiful »*. On peut donc en créer des milliers, voire des millions.

Le mécanisme : la JVM **monte** un virtual thread sur un thread plateforme (un vrai thread OS) appelé son **carrier**. Quand le virtual thread exécute une opération bloquante (I/O réseau, `BlockingQueue.take()`…), il est **démonté** et son carrier est libéré pour exécuter un autre virtual thread. Le planificateur est un `ForkJoinPool` dédié, dont le nombre de threads porteurs vaut par défaut le nombre de processeurs disponibles. Point important : il n'y a **pas d'affinité** entre un virtual thread et un carrier — il peut changer de porteur au fil de sa vie.

### Les objectifs officiels (Goals)

Le JEP est explicite sur ce qu'il vise :

- Permettre aux applications serveur écrites en **thread-per-request** de passer à l'échelle avec une utilisation quasi optimale du matériel.
- Permettre au code existant utilisant `java.lang.Thread` d'adopter les virtual threads **avec un minimum de changements**.
- Permettre un **débogage, un profilage et un troubleshooting simples** avec les outils JDK existants.

### Et ce qu'ils ne sont PAS (Non-Goals)

Tout aussi important pour un architecte :

- Ce **n'est pas** un remplacement des threads plateforme classiques, ni une migration silencieuse de l'existant.
- Ce **n'est pas** un changement du modèle de concurrence de Java.
- Ce **n'est pas** une nouvelle construction de parallélisme de données : *« The Stream API remains the preferred way to process large data sets in parallel. »*

Autrement dit : les virtual threads servent à gérer un **grand nombre de tâches majoritairement bloquantes** (typiquement de l'I/O), pas à accélérer du calcul CPU-bound.

## Comment on les utilise

Deux portes d'entrée officielles.

Création directe via l'API `Thread.Builder` :

```java
Thread t = Thread.ofVirtual().name("worker").start(() -> doWork());
t.join();

// ou, en une ligne
Thread.startVirtualThread(() -> doWork());
```

Et surtout, pour du code orienté tâches, l'`ExecutorService` `Executors.newVirtualThreadPerTaskExecutor()`, qui crée **un nouveau thread par tâche** :

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        executor.submit(() -> {
            HttpResponse<String> res = client.send(request, ofString()); // I/O bloquant
            return handle(res);
        });
    }
} // le try-with-resources attend la fin de toutes les tâches
```

Ce code lance 10 000 tâches concurrentes sans effort. Sur un thread pool classique, il faudrait dimensionner le pool et accepter la file d'attente ; ici, chaque tâche a son propre thread, bloquant sans pénaliser les autres.

## Le piège à connaître : le *pinning*

C'est le point que tout développeur doit intégrer. Dans certaines situations, un virtual thread **ne peut pas être démonté** de son carrier pendant une opération bloquante : on dit qu'il est **pinned** (épinglé). Le JEP identifie deux cas :

1. quand il exécute du code à l'intérieur d'un **bloc ou d'une méthode `synchronized`** ;
2. quand il exécute une **méthode native** ou une *foreign function*.

La source précise : *« Pinning does not make an application incorrect, but it might hinder its scalability. »* Un thread épinglé qui bloque monopolise son carrier — si ça se produit en masse, on perd le bénéfice des virtual threads.

La parade classique : remplacer les `synchronized` sur les sections susceptibles de bloquer par un `ReentrantLock` (qui, lui, sait démonter le virtual thread) :

```java
private final ReentrantLock lock = new ReentrantLock();

lock.lock();
try {
    // opération potentiellement bloquante
} finally {
    lock.unlock();
}
```

> À noter (évolution postérieure au JEP 444) : le [JEP 491](https://openjdk.org/jeps/491) supprime le pinning lié à `synchronized` dans les versions récentes du JDK. Le conseil reste toutefois utile pour tout code tournant sur Java 21.

## Les deux règles d'or : ne pas pooler, limiter avec un sémaphore

C'est le contre-intuitif le plus important, et il vient directement de la section *« Do not pool virtual threads »* du JEP.

**1. Ne poolez pas les virtual threads.** Un pool de threads existe pour partager une ressource coûteuse. Or les virtual threads ne sont *pas* coûteux : *« virtual threads are not expensive so there is never a need to pool them »*. On migre donc d'un `ExecutorService` à base de pool vers le `newVirtualThreadPerTaskExecutor()`.

**2. Pour limiter l'accès à une ressource rare, utilisez un `Semaphore`, pas un pool.** Si votre base de données ne supporte que 10 connexions simultanées, ne bridez pas *les threads* : bridez *l'accès à la ressource*.

```java
private final Semaphore dbPermits = new Semaphore(10);

void query() throws InterruptedException {
    dbPermits.acquire();          // au plus 10 requêtes concurrentes
    try {
        runQuery();
    } finally {
        dbPermits.release();
    }
}
```

Même logique pour les `ThreadLocal` : ils restent supportés, mais le JEP prévient — *« because virtual threads can be very numerous, use thread locals only after careful consideration »* — et surtout, ne vous en servez pas pour mettre en cache des ressources coûteuses, puisqu'il peut y avoir des millions de threads.

## Ce que ça change pour l'architecture

Le message pour un lead ou un architecte est clair : les virtual threads permettent de **revenir à un code synchrone, lisible, thread-per-request** tout en tenant une charge qui imposait auparavant du réactif. On garde la simplicité du modèle bloquant *et* la scalabilité — sans réécrire l'API `Thread`.

Mais ce n'est pas une baguette magique : inutile pour du CPU-bound (le `Stream` parallèle reste la bonne réponse), attention au pinning sur Java 21, et on raisonne désormais en *limitation de ressources* (sémaphores) plutôt qu'en *dimensionnement de pools*.

## Sources
- **Source officielle** : JEP 444 « Virtual Threads » (Ron Pressler & Alan Bateman), statut *Closed/Delivered*, livré dans JDK 21 — https://openjdk.org/jeps/444
- Évolution du pinning : JEP 491 « Synchronize Virtual Threads without Pinning » — https://openjdk.org/jeps/491
