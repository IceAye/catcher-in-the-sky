export class Controller {

  constructor(model , view) {
    this.#model = model;
    this.#view = view;
  }

  #model;
  #view;

  init() {
    this.#view.render(this.#mapModelToDTO());
    this.#view.onstart = () => {
      this.#start();
    }
    this.#view.onCatcherOneMove = ({ direction }) => {
      this.#model.moveCatcher(1, direction);
    }
    this.#view.onCatcherTwoMove = ({direction}) => {
      this.#model.moveCatcher(2, direction);
    }
    this.#model.subscribe(() => {
      this.#view.render(this.#mapModelToDTO());
    });
  }

  #start() {
    this.#model.start();
    this.#view.render( this.#mapModelToDTO());
  }

  #mapModelToDTO() {
    return {
      status: this.#model.status,
      glitchPosition:  { ...this.#model.glitchPosition },
      catcherOnePosition: {...this.#model.catcherOnePosition},
      catcherTwoPosition: {...this.#model.catcherTwoPosition},
    }
  }
}