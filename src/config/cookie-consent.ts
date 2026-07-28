import { acceptedCategory, type CookieConsentConfig } from "vanilla-cookieconsent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function updateGtagConsent() {
  if (typeof window.gtag !== "function") return;

  const analyticsGranted = acceptedCategory("analytics");

  window.gtag("consent", "update", {
    analytics_storage: analyticsGranted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  if (analyticsGranted) {
    window.dataLayer.push({ event: "analytics_consent_granted" });
  }
}

export const cookieConsentConfig: CookieConsentConfig = {
  mode: "opt-in",
  revision: 0,
  autoShow: true,
  manageScriptTags: false,
  autoClearCookies: true,

  guiOptions: {
    consentModal: {
      layout: "box",
      position: "bottom left",
      equalWeightButtons: true,
      flipButtons: false,
    },
    preferencesModal: {
      layout: "box",
      equalWeightButtons: true,
    },
  },

  categories: {
    necessary: {
      readOnly: true,
      enabled: true,
    },
    analytics: {
      autoClear: {
        cookies: [
          { name: /^_ga/ },
          { name: "_gid" },
          { name: /^_gat/ },
        ],
      },
    },
  },

  onConsent: updateGtagConsent,
  onChange: updateGtagConsent,

  language: {
    default: "fr",
    translations: {
      fr: {
        consentModal: {
          title: "Nous utilisons des cookies",
          description:
            "Ce site utilise des cookies pour mesurer son audience de manière anonyme. Vous pouvez accepter, refuser ou personnaliser vos choix.",
          acceptAllBtn: "Tout accepter",
          acceptNecessaryBtn: "Tout refuser",
          showPreferencesBtn: "Préférences",
          footer: `
            <a href="/confidentialite">Politique de confidentialité</a>
          `,
        },
        preferencesModal: {
          title: "Préférences de cookies",
          acceptAllBtn: "Tout accepter",
          acceptNecessaryBtn: "Tout refuser",
          savePreferencesBtn: "Enregistrer",
          closeIconLabel: "Fermer",
          sections: [
            {
              title: "Utilisation des cookies",
              description:
                "Vous pouvez choisir quels cookies autoriser. Les cookies nécessaires sont toujours actifs car ils permettent de mémoriser votre choix.",
            },
            {
              title: "Cookies strictement nécessaires",
              description:
                "Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés.",
              linkedCategory: "necessary",
            },
            {
              title: "Cookies de mesure d'audience",
              description:
                "Ces cookies nous aident à comprendre comment le site est utilisé (pages visitées, durée de visite) via Google Analytics, uniquement si vous les acceptez.",
              linkedCategory: "analytics",
              cookieTable: {
                headers: {
                  name: "Nom",
                  domain: "Domaine",
                  description: "Description",
                  expiration: "Durée",
                },
                body: [
                  {
                    name: "_ga",
                    domain: "repaircafe74.fr",
                    description: "Identifiant anonyme pour Google Analytics 4",
                    expiration: "13 mois",
                  },
                  {
                    name: "_ga_*",
                    domain: "repaircafe74.fr",
                    description: "État de session Google Analytics 4",
                    expiration: "13 mois",
                  },
                ],
              },
            },
          ],
        },
      },
    },
  },
};
