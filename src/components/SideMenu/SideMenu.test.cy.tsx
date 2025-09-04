import { useState } from "react";

import { LeftMenu, RightMenu } from "../SideMenu";

// Test Fixtures
function newTestApp(position: "left" | "right") {
  const Menu = position === "left" ? LeftMenu : RightMenu;

  return function TestApp() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
      <div
        data-cy="app"
        className="appContainer"
        style={{ overflowX: "hidden" }}
      >
        <button
          data-cy="toggle-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          Open Menu
        </button>
        <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
          Menu Contents
        </Menu>
        <div data-cy="main-content">Main Content</div>
      </div>
    );
  };
}

// Tests
function menuTest(position: "left" | "right") {
  const isLeft = position === "left";

  // 1. Check initial state
  cy.dataCy(`${position}-menu`)
    .as("menu")
    .should("not.be.visible")

    .contains("Menu Contents")
    .should("not.be.visible");

  // 2. Open menu
  cy.dataCy("toggle-menu")
    .as("toggle")
    .click()

    .get("@menu")
    .should("be.visible")

    .contains("Menu Contents")
    .should("be.visible");

  // 3. Close menu with button
  cy.dataCy("close-menu")
    .as("close")
    .click()

    .get("@menu")
    .should("not.be.visible")

    .contains("Menu Contents")
    .should("not.be.visible");

  // 4. Reopen menu, verify interactivity, then close with underlay
  cy.get("@toggle")
    .click()

    .get("@menu")
    .should("be.visible")
    .click("center")

    .get("@menu")
    .should("be.visible")

    .dataCy("app")
    .click(isLeft ? "topRight" : "topLeft")

    .get("@menu")
    .should("not.be.visible");
}

beforeEach(() => {
  cy.disableTransitions();
});

afterEach(() => {
  cy.enableTransitions();
});

describe("LeftMenu Tests", () => {
  beforeEach(() => {
    const TestApp = newTestApp("left");
    cy.mount(<TestApp />);
  });

  afterEach(() => {
    cy.enableTransitions();
  });

  it("works in portrait", () => {
    cy.viewport("iphone-6");
    menuTest("left");
  });

  it("works in landscape", () => {
    cy.viewport("iphone-6", "landscape");
    menuTest("left");
  });
});

describe("RightMenu Tests", () => {
  beforeEach(() => {
    const TestApp = newTestApp("right");
    cy.mount(<TestApp />);
  });

  it("works in portrait", () => {
    cy.viewport("iphone-6");
    menuTest("right");
  });

  it("works in landscape", () => {
    cy.viewport("iphone-6", "landscape");
    menuTest("right");
  });
});
