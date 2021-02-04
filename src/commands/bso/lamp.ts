import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID, toTitleCase } from '../../lib/util';
import { XPLamps } from '../../lib/xpLamps';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<item:item> <skill:string>',
			usageDelim: ','
		});
	}

	async run(msg: KlasaMessage, [[item], skillName]: [Item[], string]) {
		const lamp = XPLamps.find(lamp => lamp.itemID === item.id);
		if (!lamp) {
			return msg.send(`That's not a valid XP Lamp.`);
		}

		skillName = skillName.toLowerCase();
		if (skillName === 'magic' && lamp.itemID !== 6796) {
			return msg.send('Your lamp seems to not work with this skill for some reason...');
		}

		if (skillName === 'magic' && msg.author.skillLevel(SkillsEnum.Magic) > 10) {
			return msg.send('Your lamp seems to not work with this skill for some reason...');
		}

		const isValidSkill = Object.values(Skills).some(skill => skill.id === skillName);
		if (!isValidSkill) {
			return msg.send(`That's not a valid skill.`);
		}

		const bank = new Bank(msg.author.settings.get(UserSettings.Bank));
		if (bank.amount(lamp.itemID) === 0) {
			return msg.send(`You don't have any ${lamp.name} lamps!`);
		}

		await msg.author.addXP(skillName as SkillsEnum, lamp.amount, false);
		await msg.author.removeItemFromBank(lamp.itemID);

		return msg.send(
			`Added ${lamp.amount.toLocaleString()} ${toTitleCase(
				skillName
			)} XP from your ${itemNameFromID(lamp.itemID)}`
		);
	}
}