import { Event } from '@structures';

class MessageEvent extends Event<'RECEIVED_MESSAGE'> {
	run(payload: Message): void {
		console.log('Message received:', payload);
		console.log('Reply to:', payload.replyingToMessage);
	}
}

export default new MessageEvent({ name: 'RECEIVED_MESSAGE' });