import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Intercepteur SERVEUR uniquement : résout les requêtes vers `assets/**` depuis
 * le disque au lieu du réseau.
 *
 * Pourquoi. Les articles vivent dans des fichiers Markdown chargés par
 * ArticlesService via HttpClient. Côté navigateur, une URL relative se résout
 * contre le <base href> et tout fonctionne. Au prérendu il n'y a ni serveur HTTP
 * ni document, donc la requête échoue, et ArticlesService se contentait jusqu'ici
 * de ne rien charger hors navigateur. Résultat, les pages prérendues ne
 * contenaient que la coquille : un robot d'indexation, ou un modèle qui cite des
 * sources, ne voyait aucun article.
 *
 * Cet intercepteur comble ce trou en lisant le fichier sur le disque, ce qui
 * permet au prérendu de produire du HTML complet.
 *
 * Les chemins essayés couvrent les deux situations : pendant `ng build` les
 * assets sont déjà copiés dans la sortie du build, et en repli on lit la source.
 */
const ASSET_ROOTS = [
  join(process.cwd(), 'dist', 'cybergarage', 'browser'),
  join(process.cwd(), 'src'),
];

export const assetsFromDiskInterceptor: HttpInterceptorFn = (req, next) => {
  const match = req.url.match(/assets\/.+$/);
  if (!match || req.method !== 'GET') {
    return next(req);
  }

  const relative = match[0];
  for (const root of ASSET_ROOTS) {
    const candidate = join(root, relative);
    if (existsSync(candidate)) {
      return of(
        new HttpResponse({
          body: readFileSync(candidate, 'utf-8'),
          status: 200,
          url: req.url,
        }),
      );
    }
  }

  // Fichier absent du disque : on laisse la requête suivre son cours, pour que
  // l'échec reste visible au lieu d'être masqué par une réponse vide.
  return next(req);
};
