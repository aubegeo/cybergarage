# Catalogue de sources officielles — pipeline d'articles CyberGarage

Ce fichier alimente la génération d'articles (skill `article-source-officielle` + routine
quotidienne). **Tu peux l'éditer librement** : ajoute une ligne sous la bonne catégorie et
elle deviendra candidate pour un futur article.

## Mode d'emploi
- Chaque puce = une **idée d'article** rattachée à sa **source officielle** (URL).
- `[libre]` = source consultable librement · `[payant]` = norme payante (à éviter, ou trouver un
  résumé officiel équivalent).
- `[fait]` = article déjà publié (voir `src/app/shared/content-catalog.ts`) — ne pas redoubler.
- Quand la routine choisit un sujet ici, elle vérifie d'abord que le slug n'existe pas déjà dans
  `content-catalog.ts`, écrit l'article, puis peut cocher `[fait]` dans ce fichier.
- Priorité : sources **primaires** (l'éditeur/l'organisme), jamais un blog tiers.

---

## automobile
- Freinage régénératif — [fait]
- Niveaux de conduite autonome (taxonomie SAE J3016) — https://www.sae.org/standards/content/j3016_202104/ `[payant]` (chart de synthèse SAE en libre accès)
- Véhicules automatisés & sécurité — https://www.nhtsa.gov/vehicle-safety/automated-vehicles-safety `[libre]`
- Réglementations véhicules UNECE (WP.29) — https://unece.org/transport/vehicle-regulations `[libre]`
- Bases sur les véhicules électriques — https://afdc.energy.gov/vehicles/electric `[libre]` (US DOE)

## dev-info (Artisan Développeur)
- Microservices Docker/Kubernetes — [fait]
- Java Virtual Threads (JEP 444) — [fait]
- Java Records (JEP 395) — https://openjdk.org/jeps/395 `[libre]`
- Pattern Matching for switch (JEP 441) — https://openjdk.org/jeps/441 `[libre]`
- Sealed Classes (JEP 409) — https://openjdk.org/jeps/409 `[libre]`
- Structured Concurrency (JEP 505) — https://openjdk.org/jeps/505 `[libre]`
- Angular Signals — https://angular.dev/guide/signals `[libre]`
- Angular control flow (@if/@for) — https://angular.dev/guide/templates/control-flow `[libre]`
- Reactive Streams (spec) — https://www.reactive-streams.org/ `[libre]`

## ia-master (IA Master)
- Model Context Protocol (introduction) — [fait]
- MCP — architecture & concepts — https://modelcontextprotocol.io/docs/learn/architecture `[libre]`
- Anthropic — prompt engineering — https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview `[libre]`
- Anthropic — tool use (function calling) — https://docs.anthropic.com/en/docs/build-with-claude/tool-use `[libre]`
- Anthropic — prompt caching — https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching `[libre]`
- « Attention Is All You Need » (Transformer, source primaire) — https://arxiv.org/abs/1706.03762 `[libre]`

## cybersecurity (Cybersécurité)
- Zero Trust (concept) — [fait: zero-trust-architecture]
- OWASP Top 10 (2021) — [fait]
- NIST SP 800-207 « Zero Trust Architecture » (source officielle du concept) — https://csrc.nist.gov/pubs/sp/800/207/final `[libre]`
- OWASP ASVS (Application Security Verification Standard) — https://owasp.org/www-project-application-security-verification-standard/ `[libre]`
- MITRE ATT&CK — https://attack.mitre.org/ `[libre]`
- OAuth 2.0 (RFC 6749) — https://www.rfc-editor.org/rfc/rfc6749 `[libre]`
- JSON Web Token / JWT (RFC 7519) — https://www.rfc-editor.org/rfc/rfc7519 `[libre]`

## fpga (FPGA & Embarqué)
- Traitement vidéo temps réel — [fait]
- Leçons du dev embarqué — [fait]
- Jeu d'instructions RISC-V (spec officielle) — https://riscv.org/technical/specifications/ `[libre]`
- Zephyr RTOS (documentation) — https://docs.zephyrproject.org/latest/ `[libre]`
- ARM Cortex-M — documentation développeur — https://developer.arm.com/documentation `[libre]`

## mechanical (Mécanique)
> Beaucoup de normes méca (ISO, ASME) sont payantes — privilégier les sources publiques ci-dessous.
- NASA Technical Standards — https://standards.nasa.gov/ `[libre]`
- NASA Systems Engineering Handbook — https://www.nasa.gov/reference/systems-engineering-handbook/ `[libre]`
- NIST — Engineering Laboratory (publications) — https://www.nist.gov/el/publications `[libre]`

## electronics (Électronique)
- Onduleurs solaires — [fait]
- Spécification USB (USB-IF) — https://www.usb.org/documents `[libre]`
- Bus I²C — UM10204 (NXP, officiel) — https://www.nxp.com/docs/en/user-guide/UM10204.pdf `[libre]`
- Documentation KiCad — https://docs.kicad.org/ `[libre]`
- Datasheets STM32 (ST) — https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html `[libre]`

## pragmatic (Pragmatic Engineer)
- GenAI et développeurs — [fait]
- The Twelve-Factor App — [fait]
- Semantic Versioning (SemVer 2.0) — https://semver.org/ `[libre]`
- Conventional Commits — https://www.conventionalcommits.org/ `[libre]`
- Keep a Changelog — https://keepachangelog.com/ `[libre]`
- Manifeste Agile — https://agilemanifesto.org/ `[libre]`
- Google SRE (livres en ligne) — https://sre.google/books/ `[libre]`
- OpenAPI Specification — https://spec.openapis.org/oas/latest.html `[libre]`

## hpc (HPC)
- Optimisation GPU — [fait]
- Standard MPI (Message Passing Interface) — https://www.mpi-forum.org/docs/ `[libre]`
- Spécification OpenMP — https://www.openmp.org/specifications/ `[libre]`
- Documentation CUDA (NVIDIA) — https://docs.nvidia.com/cuda/ `[libre]`
- TOP500 (méthodologie du classement) — https://top500.org/project/ `[libre]`

## telecom (Télécom)
- Réseaux intelligents — [fait]
- HTTP/3 (RFC 9114) — [fait] (PR)
- QUIC (RFC 9000) — https://www.rfc-editor.org/rfc/rfc9000 `[libre]`
- TLS 1.3 (RFC 8446) — https://www.rfc-editor.org/rfc/rfc8446 `[libre]`
- HTTP/2 (RFC 9113) — https://www.rfc-editor.org/rfc/rfc9113 `[libre]`
- DNS over HTTPS / DoH (RFC 8484) — https://www.rfc-editor.org/rfc/rfc8484 `[libre]`
- WebSocket (RFC 6455) — https://www.rfc-editor.org/rfc/rfc6455 `[libre]`
- MQTT 5.0 (OASIS) — https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html `[libre]`

## simulation (Simulation)
- Simulation physique — [fait]
- Functional Mock-up Interface (FMI) — https://fmi-standard.org/docs/ `[libre]`
- Documentation OpenFOAM — https://www.openfoam.com/documentation/ `[libre]`
- Documentation Gmsh (maillage) — https://gmsh.info/doc/texinfo/gmsh.html `[libre]`
