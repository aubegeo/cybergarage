---
title: "I2C sur ESP32 : maîtriser la nouvelle API bus-device de l'ESP-IDF"
category: electronics
date: 2026-08-05
author: Geoffrey Aubert
tags: ["ESP32", "I2C", "Espressif", "ESP-IDF", "electronique-embarquee"]
summary: "Comment l'ESP-IDF matérialise le protocole I2C générique dans son API moderne bus-device (i2c_master.h / i2c_slave.h) : structures de configuration, transactions maître, esclave en contexte ISR, thread-safety et gestion d'énergie."
readTime: 9
---

# I2C sur ESP32 : maîtriser la nouvelle API bus-device de l'ESP-IDF

Sur un ESP32, il suffit souvent de deux fils, SDA et SCL, pour parler à un capteur de température, un écran
OLED ou une centrale inertielle. Derrière cette simplicité apparente se cache un
protocole avec ses propres règles de synchronisation, ses limites de fréquence et ses pièges
matériels, en particulier une limitation propre à l'ESP32 qu'il vaut mieux connaître avant de
déboguer un bus qui « ne répond plus ». Cet article s'appuie exclusivement sur le
[guide de programmation officiel ESP-IDF, section I2C](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/i2c.html)
(branche « latest ») ainsi que sur la nouvelle API « bus-device » exposée par les headers
`driver/i2c_master.h` et `driver/i2c_slave.h`.

## Le protocole I2C, en bref

La documentation définit I2C comme « a serial, synchronous, multi-device, half-duplex
communication protocol that allows co-existence of multiple masters and slaves on the same
bus ». Concrètement, les échanges se font sur deux lignes bidirectionnelles, « serial data line
(SDA) and serial clock line (SCL), pulled up by resistors », c'est-à-dire des lignes en drain ouvert
tirées au niveau haut par des résistances externes et jamais pilotées activement au niveau haut par
un device.

Côté ESP32, la doc précise que « ESP32 has 2 I2C controller(s) (also called port), responsible
for handling communication on the I2C bus », soit deux contrôleurs indépendants, chacun configurable
en maître ou en esclave. L'adressage des esclaves suit le standard, la doc précisant que « Typically, an I2C slave
device has a 7-bit address or 10-bit address. »

Sur les vitesses, l'ESP-IDF est clair en indiquant que « ESP32 supports both I2C Standard-mode (Sm) and
Fast-mode (Fm) which can go up to 100 kHz and 400 kHz respectively », avec une contrainte
explicite qui fait souvent l'objet d'erreurs de conception, puisque « The clock frequency of SCL in
master mode should not be larger than 400 kHz. » Il est donc impossible de pousser un bus I2C ESP32 en
Fast-mode Plus (1 MHz) côté maître.

## Le bon dimensionnement des résistances de pull-up

Comme les lignes sont en drain ouvert, le choix des résistances de pull-up n'est pas un détail
cosmétique, puisqu'il conditionne directement la fiabilité du bus. La doc recommande une plage
générale de « 1 kΩ to 10 kΩ », mais affine ensuite le compromis vitesse/résistance en précisant que « Keep in
mind that the higher the frequency, the smaller the pull-up resistor should be (but not less
than 1 kΩ). Indeed, large resistors will decline the current, which will increase the clock
switching time and reduce the frequency. » La plage la plus souvent conseillée en pratique est
plus resserrée, la doc indiquant que « A range of 2 kΩ to 5 kΩ is recommended, but adjustments may also be necessary
depending on their current draw requirements. »

En clair, une résistance trop forte ralentit les fronts de montée (donc limite la fréquence
utilisable), une résistance trop faible consomme plus de courant et peut saturer les capacités
de sortie des devices. 2-5 kΩ est un bon compromis par défaut pour du Fast-mode à 400 kHz.

## Le piège du clock stretching en mode esclave

C'est sans doute le point le plus important à retenir pour qui développe un esclave I2C sur
ESP32, puisque la documentation indique que « The ESP32 I2C controller does not support clock stretching when operating as a
slave. » Le clock stretching est le mécanisme par lequel un esclave I2C standard peut maintenir
SCL au niveau bas pour ralentir le maître le temps de préparer une donnée, mécanisme dont l'ESP32 ne peut pas
se servir dans ce rôle. La documentation recommande donc explicitement d'autres stratégies de
synchronisation, en indiquant que « it is recommended to use application-layer data verification, GPIO signal
synchronization, or other methods to achieve data synchronization between master and slave. »
Autrement dit, si l'ESP32 joue l'esclave face à un maître qui va trop vite, la synchronisation
doit être gérée au niveau applicatif (retransmission, vérification de checksum) ou via une ligne
GPIO dédiée, plutôt qu'en comptant sur le protocole I2C lui-même.

## L'architecture bus-device de l'ESP-IDF

L'API moderne (`driver/i2c_master.h`) sépare clairement deux niveaux de configuration : le
**bus** (le port physique, les broches, l'horloge) et le **device** (l'adresse et la vitesse
propres à un esclave donné). On configure d'abord le bus avec `i2c_master_bus_config_t`, dont
les champs principaux sont, selon la doc :

- `i2c_port` : « sets the I2C port used by the controller » ;
- `sda_io_num` / `scl_io_num` : « sets the GPIO number for the serial data bus (SDA) » (et pour SCL) ;
- `clk_source` : « selects the source clock for I2C bus » ;
- `glitch_ignore_cnt` : « if the glitch period on the line is less than this value, it can be
  filtered out », soit un filtrage anti-parasite matériel ;
- `enable_internal_pullup` (dans `flags`) : à manier avec prudence, car « this is not strong
  enough to pullup buses under high-speed frequency. A suitable external pullup is recommended » ;
- `allow_pd` : autorise le driver, en veille (« sleep »), à « backup the I2C register context,
  which will be restored later when the system exit the sleep mode ».

On crée ensuite le bus avec `i2c_new_master_bus()`, dont la doc dit qu'elle « allocate and
initialize an I2C master bus » et renvoie un handle. Chaque esclave est ensuite « monté » sur ce
bus via `i2c_device_config_t`, avec `dev_addr_length` (`I2C_ADDR_BIT_LEN_7` ou `_10`),
`device_address` (précisé pour le 7 bits par « use the 7-bit address instead of an 8-bit
address ») et `scl_speed_hz`, puis `i2c_master_bus_add_device()`, qui « allocate an I2C device
instance and mounted to the master bus ».

## Écrire un maître I2C : l'exemple de référence

Voici l'exemple d'initialisation et d'écriture donné par la documentation officielle, quasiment
tel quel :

```c
#define DATA_LENGTH 100

i2c_master_bus_config_t i2c_mst_config = {
    .clk_source = I2C_CLK_SRC_DEFAULT,
    .i2c_port = I2C_PORT_NUM_0,
    .scl_io_num = I2C_MASTER_SCL_IO,
    .sda_io_num = I2C_MASTER_SDA_IO,
    .glitch_ignore_cnt = 7,
};
i2c_master_bus_handle_t bus_handle;

ESP_ERROR_CHECK(i2c_new_master_bus(&i2c_mst_config, &bus_handle));

i2c_device_config_t dev_cfg = {
    .dev_addr_length = I2C_ADDR_BIT_LEN_7,
    .device_address = 0x58,
    .scl_speed_hz = 100000,
};

i2c_master_dev_handle_t dev_handle;
ESP_ERROR_CHECK(i2c_master_bus_add_device(bus_handle, &dev_cfg, &dev_handle));

ESP_ERROR_CHECK(i2c_master_transmit(dev_handle, data_wr, DATA_LENGTH, -1));
```

`i2c_master_transmit()` « Perform[s] a write transaction on the I2C bus » tandis que son symétrique
`i2c_master_receive()` « Perform[s] a read transaction on the I2C bus », avec la même structure
d'appel, en remplaçant le buffer d'écriture par un buffer de lecture.

Le cas d'usage le plus courant en pratique, qui consiste à lire un registre d'un capteur, combine écriture et
lecture sans relâcher le bus entre les deux via `i2c_master_transmit_receive()`, la doc précisant
que cette fonction effectue une « write-read transaction » où « no STOP condition bit is
inserted between the write and read operations », comme dans l'exemple suivant :

```c
uint8_t buf[20] = {0x20};   // adresse de registre à lire
uint8_t buffer[2];
ESP_ERROR_CHECK(i2c_master_transmit_receive(dev_handle, buf, sizeof(buf), buffer, 2, -1));
```

C'est exactement le pattern « write register address, repeated-start, read value » que l'on
retrouve sur la quasi-totalité des capteurs I2C du marché.

## Scanner le bus, transmettre en plusieurs morceaux, sortir du protocole standard

Pour détecter la présence d'un device sans connaître à l'avance son comportement,
`i2c_master_probe()` permet de « detect whether the specific device has been connected on I2C
bus. If this function return `ESP_OK`, that means the device has been detected », ce qui correspond à un scan de
bus classique, qui suppose bien sûr que les résistances de pull-up sont en place. Pour envoyer
plusieurs buffers logiquement distincts dans une seule transaction (par exemple un octet de
commande suivi d'un payload variable, cas typique des écrans LCD pilotés en I2C),
`i2c_master_multi_buffer_transmit()` permet de « transmit multiple buffers of data over an I2C
bus » sans les recopier dans un tampon unique.

Enfin, certains devices ne respectent pas strictement le protocole I2C standard, par exemple en
n'attendant pas le décalage habituel de l'adresse d'un bit pour coder lecture/écriture. Pour ces
cas, `i2c_master_execute_defined_operations()` « processes a list of I2C operations […]
according to the user-defined array », en assemblant à la main des commandes bas niveau
(`I2C_MASTER_CMD_START`, `I2C_MASTER_CMD_WRITE`, `I2C_MASTER_CMD_STOP`...). Une règle de
protocole est explicitement rappelée par la doc pour ces transactions personnalisées, à savoir que « The
`ack_value` field in the READ operation must be set to `I2C_NACK_VAL` if the next operation is a
STOP command », ce qui signifie que le dernier octet lu avant un STOP doit toujours être NACK, faute de quoi le bus
peut se retrouver dans un état incohérent.

## Côté esclave : des callbacks en contexte ISR

Quand l'ESP32 joue le rôle d'esclave (`driver/i2c_slave.h`), l'API repose sur deux callbacks :
`on_request`, déclenché « for when a master requests data from the slave » (typiquement quand
« master want to read data from slave while there is no data in slave fifo », le code applicatif
répond alors via `i2c_slave_write()`) ainsi que `on_receive`, déclenché « for when the slave receives
data from the master ». Un point de vigilance est impératif puisque « the callbacks are all running under ISR
context », ce qui exclut tout appel bloquant et toute allocation dynamique classique tout en imposant l'usage des
primitives FreeRTOS dédiées à l'ISR (les variantes `...FromISR`) pour toute interaction avec le
reste de l'application.

## Thread-safety et gestion d'énergie

Deux points opérationnels complètent le tableau. D'abord pour la thread-safety, les fonctions de
transaction (`i2c_master_transmit`, `i2c_master_receive`, `i2c_master_transmit_receive`,
`i2c_master_probe`, `i2c_master_multi_buffer_transmit`) sont protégées via une « bus operation
semaphore », donc appelables depuis plusieurs tâches sans précaution supplémentaire, mais la
doc prévient que les autres fonctions « are not guaranteed to be thread-safe. Thus, you should
avoid calling them in different tasks without mutex protection. »

Ensuite, pour la gestion d'énergie, dès qu'un bus utilise `I2C_CLK_SRC_APB` comme source d'horloge,
le driver acquiert automatiquement un verrou `ESP_PM_APB_FREQ_MAX` (« the driver will guarantee
that the power management lock is acquired when I2C operations begin and the lock will be
released automatically when I2C operations finish ») précisément pour éviter que l'entrée en
light-sleep ne fasse varier la fréquence APB en pleine transaction et ne corrompe le signal.

## En résumé

L'API bus-device de l'ESP-IDF traduit fidèlement les contraintes physiques d'I2C (pull-ups en
drain ouvert, limite à 400 kHz, adressage 7/10 bits) dans une architecture logicielle propre :
un bus partagé, des devices montés dessus avec leur propre vitesse et des fonctions de
transaction thread-safe couvrant l'essentiel des cas d'usage, de la simple écriture au scan de
bus, en passant par les transactions personnalisées pour les capteurs non conformes. La seule
vraie limitation matérielle à garder en tête est l'absence de clock stretching côté esclave, puisque sur
un ESP32 la synchronisation maître/esclave doit être pensée en amont, au niveau applicatif ou
via un GPIO dédié, plutôt que déléguée au protocole.

## Sources

- **Source officielle** : Espressif Systems, *ESP-IDF Programming Guide*, section « Inter-Integrated Circuit (I2C) », cible ESP32, branche « latest », https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/i2c.html
