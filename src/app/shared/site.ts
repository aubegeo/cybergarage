/**
 * Source unique des informations personnelles / liens.
 * Utilisé par le footer ET le JSON-LD SEO (sameAs).
 *
 * 👉 Remplace les URLs vides ci-dessous par tes vrais profils.
 *    Un lien vide n'est tout simplement pas affiché (aucun lien mort).
 */
interface SiteConfig {
  name: string;
  role: string;
  baseUrl: string;
  /** Email de contact public. Laisse vide pour ne pas l'afficher (anti-spam). */
  email: string;
  socials: { linkedin: string; github: string };
}

export const SITE: SiteConfig = {
  name: 'Geoffrey Aubert',
  role: 'Développeur Senior Java / Angular',
  baseUrl: 'https://cybergarage.tech',
  email: '', // ex. 'contact@cybergarage.tech' — laissé vide pour l'instant
  socials: {
    linkedin: 'https://www.linkedin.com/in/geoffreyaubert/',
    github: 'https://github.com/aubegeo',
  },
};

/** Renvoie la liste des URLs sociales non vides (pour le JSON-LD sameAs). */
export function sameAs(): string[] {
  return Object.values(SITE.socials).filter((url) => !!url);
}
