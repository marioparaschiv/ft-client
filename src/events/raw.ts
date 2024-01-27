import { Event } from '@structures';

// The RAW event captures all events.
class Message extends Event<'RAW'> {
	run(payload: any): void {
		console.log('Raw event received:', payload);
	}
}

export default new Message({ name: 'RAW' });