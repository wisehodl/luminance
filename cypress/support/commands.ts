/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add("dataCy", (value: string) => {
  return cy.get(`[data-cy="${value}"]`);
});

Cypress.Commands.add("disableTransitions", () => {
  cy.document().then((document) => {
    const style = document.createElement("style");
    style.id = "cypress-disable-transitions";
    style.innerHTML = `
      * {
        transition: none !important;
        animation: none !important;
        animation-duration: 0ms !important;
        transition-duration: 0ms !important;
      }
    `;
    document.head.appendChild(style);

    // Flag to disable Framer Motion
    if (window.framerMotionTestOverride) return;
    window.framerMotionTestOverride = true;
    window.originalRequestAnimationFrame = window.requestAnimationFrame;

    window.requestAnimationFrame = (callback) => {
      return window.setTimeout(() => {
        if (callback) callback(0);
      }, 0);
    };

    document.body.setAttribute("data-cy-animations-disabled", "true");
  });
});

Cypress.Commands.add("enableTransitions", () => {
  cy.document().then((document) => {
    const styleElement = document.getElementById("cypress-disable-transitions");
    if (styleElement) {
      styleElement.remove();
    }

    // Remove flags for Framer Motion
    if (window.framerMotionTestOverride) {
      window.framerMotionTestOverride = false;

      if (window.originalRequestAnimationFrame) {
        window.requestAnimationFrame = window.originalRequestAnimationFrame;
        delete window.originalRequestAnimationFrame;
      }
    }

    document.body.removeAttribute("data-cy-animations-disabled");
  });
});
