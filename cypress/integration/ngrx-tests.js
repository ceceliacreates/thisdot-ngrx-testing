/// <reference types="cypress" />

describe("ngrx store tests",  () => {

    beforeEach("it visits the site", () => {

        cy.visit("/")

    })
    it("validates getAllSuccess action", () => {

        // We expect getAllSuccess to dispatch on appLoaded due to the getAllShows$ effect

        // validate the four shows loaded via the DOM

        cy.get("[data-cy=show-card]").should("have.length", 4)

        // go further and validate the getAllShows$ effect dispatched the getAllSuccess action on appLoaded

        cy.window().then(w => {

            // tap into the store to access the last action and its value
            const store = w.store;
            const action = store.actionsObserver._value;
            const shows = store.actionsObserver._value.shows;
            
            // expect action type and length of shows array to match expected values
            expect(action.type).equal("[Shows API] Get all shows success");
            expect(shows.length).equal(4);

        });


    });

    it("validates favoriteShowClicked action and effect", () => {

        // selects the first favorite show via app actions
        cy.window().its('store').invoke('dispatch', { showId: 1, type: '[All Shows] favorite show'});

         // selects the second favorite show via the DOM
         cy.get("[data-cy=favorite]").eq(1).click();

        // confirms the actions completed via the DOM
        cy.get("[data-cy=unfavorite]").should("have.length", 2)

        // confirms the expected effect completed via NgRX
        cy.window().then(w => {

            // gets most recent action from store
            const store = w.store;
            const action = store.actionsObserver._value
            
            // confirms it is the effect expected after favoriteShowClicked
            expect(action.type).equal("[Shows API] favorite show success");
            expect(action.showId).equal(2)

        });

        // validates there are two favorite shows via the DOM

        // navigate to Favorites page
        cy.contains('Favorite Shows').click();
        cy.get("[data-cy=remove]").should("have.length", 2)
    })

})
