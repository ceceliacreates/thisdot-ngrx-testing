# Testing NgRx Actions and Effects with Cypress

## The App - thisdot-ngrx-testing

Hello! This is a fork of an excellent [demo Angular/NgRx app](https://github.com/frederikprijck/thisdot-ngrx-testing) developed by [frederikprijck](https://github.com/frederikprijck).

This app was originally developed to demonstrate NgRx unit testing for This Dot JavaScript Marathon, and I highly recommend you check out the [tutorial video](https://www.youtube.com/watch?v=NOT-nJLDnyg) for an overview of the application and unit tests.

## Testing with Cypress

I've added some Cypress tests to demonstrate methods for testing NgRx actions and effects in the browser with Cypress. This method gives Cypress access to your NgRx store to make assertions and dispatch actions to augment your UI or end-to-end tests.

### Exposing the NgRx store to Cypress

In `app.component.ts` expose your store to the browser window only when in Cypress.

``` javascript
  constructor(private store: Store<any>) {
      if(window.Cypress){
          window.store = this.store;
  }
  ```

### Asserting on actions

You can assert on the type of action last dispatched in the NgRx store, as well as the value of props.

``` javascript
cy.window().then(w => {
    // tap into the store to access the last action and its value
    const store = w.store;
    const action = store.actionsObserver._value;
    const shows = store.actionsObserver._value.shows;

    // expect action type and length of shows array to match expected values
    expect(action.type).equal("[Shows API] Get all shows success");
    expect(shows.length).equal(4);
    });
```

### Asserting on effects

You can confirm that expected effects occur by triggering an action (either via UI or NgRx) and validating that the expected action triggered by the effect actually took place.

In this example, we are testing the following effect:

``` typescript
favoriteShow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(allShowsActions.favoriteShowClicked, favoriteShowsActions.favoriteShowClicked),
      mergeMap(({ showId }) =>
        this.showsService
          .favoriteShow(showId)
          .pipe(map(() => favoriteShowSuccess({ showId })), catchError(error => of(null)))
      )
    )
  );
```

If we dispatch the `favoriteShowClicked` action, we would expect the `favoriteShowSuccess` action with the correct `showId` to have occured.

We can test this by trigginer the `favoriteShowClicked` action and then asserting on the most recent action from NgRx and the `showId`.

``` javascript
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
```

### Dispatching actions

You can trigger actions by using Cypress to drive the DOM, or you can dispatch them directly using the NgRx store.

``` javascript
cy.window()
.its('store')
.invoke('dispatch', { showId: 1, type: '[All Shows] favorite show'});
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Running tests

Start your server and run `npx cypress open` in a new terminal to execute the end-to-end tests in open mode in the Cypress Test Runner.

I've left the unit tests, which you can execute with `ng test` via [Karma](https://karma-runner.github.io).
