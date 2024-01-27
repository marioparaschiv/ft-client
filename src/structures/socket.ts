import { PayloadTypes, URL } from '@constants';
import { createLogger } from '@lib/logger';
import { bind, sleep } from '@utilities';
import config from '@config';
import WebSocket from 'ws';

class Socket extends WebSocket {
	logger = createLogger('FT', 'WebSocket');
	events = new Map<PayloadTypes, Array<(...args: any[]) => any>>();

	constructor() {
		super(URL.WebSocket + '?authorization=' + config.auth);
		this.logger.info('Attempting to establish connection...');

		this.on('message', this.onMessage);
		this.on('error', this.onMessage);
		this.on('open', this.onConnect);
		this.on('close', this.onClose);
	}

	@bind
	onMessage(event: WebSocket.MessageEvent): void {
		try {
			const payload = JSON.parse(String(event));
			if (!payload) return;

			switch (payload.type) {
				case PayloadTypes.PING:
					this.logger.debug('(«) Ping.');
					break;
				case PayloadTypes.PONG:
					this.logger.debug('(») Pong.');
					break;
			}

			const events = this.events.get(payload.type);
			const raw = this.events.get(PayloadTypes.RAW);

			if (events) {
				if (raw) events.push(...raw);

				for (const event of events) {
					try {
						event(payload);
					} catch (e) {
						this.logger.error(`Failed to fire listener for event ${payload.type}`);
					}
				}
			}
		} catch (error) {
			this.logger.error('Failed to parse message:', error);
		}
	};

	@bind
	async onConnect(): Promise<void> {
		this.logger.success('Connection successfully established.');
		this.sendPing();
	};

	@bind
	onClose(event: WebSocket.CloseEvent): void {
		this.logger.warn('WebSocket connection terminated:', event);
		this.logger.info('WebSocket attempting reconnection...');

		new Socket();
	};

	@bind
	onError(event: WebSocket.ErrorEvent): void {
		this.logger.error('An error occured:', event.error);
	};

	@bind
	transmit(payload: Record<any, any>) {
		const json = JSON.stringify(payload);
		return this.send(json);
	}

	onEvent(event: keyof typeof PayloadTypes, callback: (...args: any) => any) {
		const id = PayloadTypes[event];
		const events = this.events.get(id) ?? [];

		this.events.set(id, [...events, callback]);
	}

	async sendPing() {
		if (this.readyState !== WebSocket.OPEN) return;

		this.transmit({ action: 'ping' });
		this.logger.debug('(«) Ping.');

		await sleep(2500);
		this.sendPing();
	}
}

export default new Socket();