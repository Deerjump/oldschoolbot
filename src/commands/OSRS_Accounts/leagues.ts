import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';
import { AccountType } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			description: 'Shows the stats of a leagues account.',
			usage: '(username:rsn)',
			requiredPermissionsForBot: ['EMBED_LINKS'],
			examples: ['+leagues Magnaboy'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username, { type: AccountType.Seasonal });
			return msg.channel.send({
				embeds: [this.getStatsEmbed(`${username} (Shattered Relics League)`, 11_995_146, player)]
			});
		} catch (err: any) {
			return msg.channel.send(err.message);
		}
	}
}
