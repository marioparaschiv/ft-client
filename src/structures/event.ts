import { PayloadInformation, PayloadTypes } from '@constants';
import { Socket } from '@structures';

interface EventOptions {
	name: keyof typeof PayloadTypes;
}

class Event<T extends keyof typeof PayloadTypes> {
	public transmit: typeof Socket.transmit;
	public name: keyof typeof PayloadTypes;

	constructor(options: EventOptions) {
		this.transmit = Socket.transmit;
		this.name = options.name;

		Socket.onEvent(options.name, this.run.bind(this));
	}

	run(payload: PayloadInformation[T]) {

	};
}

export default Event;