import { percentChance, randInt } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Misc, Openables as _Openables } from 'oldschooljs';
import Openable from 'oldschooljs/dist/structures/Openable';

import { COINS_ID, Events, MIMIC_MONSTER_ID } from '../../lib/constants';
import botOpenables, { IronmanPMBTable } from '../../lib/data/openables';
import { emojiMap } from '../../lib/itemEmojiMap';
import ClueTiers from '../../lib/minions/data/clueTiers';
import { ClueTier } from '../../lib/minions/types';
import { countUsersWithItemInCl } from '../../lib/settings/prisma';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { rand, roll, stringMatches, updateGPTrackSetting } from '../../lib/util';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import itemID from '../../lib/util/itemID';
import resolveItems from '../../lib/util/resolveItems';
import { clueHunterOutfit } from './mclue';

const itemsToNotifyOf = resolveItems([
	'Dwarven blessing',
	'First age tiara',
	'First age amulet',
	'First age cape',
	'First age bracelet',
	'First age ring'
]);

const Openables = _Openables.filter(i => i.name !== 'Mystery box');

export const allOpenables = [
	...ClueTiers.map(i => i.id),
	...botOpenables.map(i => i.itemID),
	...Openables.map(i => i.id)
];

const itemsThatDontAddToTempCL = resolveItems([
	'Clothing Mystery Box',
	'Equippable mystery box',
	'Tester Gift box',
	'Untradeable Mystery box',
	'Pet Mystery box',
	'Holiday Mystery box',
	'Tradeable Mystery box'
]);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['clue'],
			usage: '[quantity:int{1,1000000}] [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion'],
			description: 'Opens openable items, like clue caskets, mystery boxes and crystal keys.',
			examples: ['+open easy', '+open crystal key']
		});
	}

	async showAvailable(msg: KlasaMessage) {
		const available = msg.author.bank().filter(i => allOpenables.includes(i.id));

		if (available.length === 0) {
			return 'You have no openable items.';
		}

		let results = [];
		for (const [item, qty] of available.items()) {
			let emoji = emojiMap.get(item.id) ?? '';
			results.push(`${emoji}${qty}x ${item.name}`);
		}

		return `You have ${results.join(', ')}.`;
	}

	async run(msg: KlasaMessage, [quantity = 1, name]: [number, string | undefined]) {
		if (!name) {
			return msg.channel.send(await this.showAvailable(msg));
		}

		await msg.author.settings.sync(true);
		const clue = ClueTiers.find(_tier => _tier.name.toLowerCase() === name.toLowerCase());
		if (clue) {
			return this.clueOpen(msg, quantity, clue);
		}
		const osjsOpenable = Openables.find(openable => openable.aliases.some(alias => stringMatches(alias, name)));
		if (osjsOpenable) {
			return this.osjsOpenablesOpen(msg, quantity, osjsOpenable);
		}

		return this.botOpenablesOpen(msg, quantity, name);
	}

	async clueOpen(msg: KlasaMessage, quantity: number, clueTier: ClueTier) {
		const cost = new Bank().add(clueTier.id, quantity);

		if (!msg.author.owns(cost)) {
			return msg.channel.send(
				`You don't have enough ${clueTier.name} Caskets to open!\n\n However... ${await this.showAvailable(
					msg
				)}`
			);
		}

		await msg.author.removeItemsFromBank(cost);

		const hasCHEquipped = msg.author.hasItemEquippedAnywhere(clueHunterOutfit, true);

		let extraClueRolls = 0;
		let loot = new Bank(clueTier.table.open(quantity));
		for (let i = 0; i < quantity; i++) {
			const roll = rand(1, 3);
			extraClueRolls += roll - 1;
			loot.add(clueTier.table.open(roll));
			if (clueTier.name === 'Master' && percentChance(hasCHEquipped ? 3.5 : 1.5)) {
				loot.add('Clue scroll (grandmaster)');
			}
		}

		let mimicNumber = 0;
		if (clueTier.mimicChance) {
			for (let i = 0; i < quantity; i++) {
				if (roll(clueTier.mimicChance)) {
					loot.add(Misc.Mimic.open(clueTier.name as 'master' | 'elite'));
					mimicNumber++;
				}
			}
		}

		const opened = `You opened ${quantity} ${clueTier.name} Clue Casket${quantity > 1 ? 's' : ''} ${
			mimicNumber > 0 ? `with ${mimicNumber} mimic${mimicNumber > 1 ? 's' : ''}` : ''
		}`;

		const nthCasket = (msg.author.settings.get(UserSettings.ClueScores)[clueTier.id] ?? 0) + quantity;

		// If this tier has a milestone reward, and their new score meets the req, and
		// they don't own it already, add it to the loot.
		if (
			clueTier.milestoneReward &&
			nthCasket >= clueTier.milestoneReward.scoreNeeded &&
			(await msg.author.numOfItemsOwned(clueTier.milestoneReward.itemReward)) === 0
		) {
			loot.add(clueTier.milestoneReward.itemReward);
		}

		// Here we check if the loot has any ultra-rares (3rd age, gilded, bloodhound),
		// and send a notification if they got one.
		const announcedLoot = loot.filter(i => itemsToNotifyOf.includes(i.id), false);
		if (announcedLoot.length > 0) {
			this.client.emit(
				Events.ServerNotification,
				`**${msg.author.username}'s** minion, ${msg.author.minionName}, just opened their ${formatOrdinal(
					nthCasket
				)} ${clueTier.name} casket and received **${announcedLoot}**!`
			);
		}

		if (Object.keys(loot).length === 0) {
			return msg.channel.send(`${opened} and got nothing :(`);
		}

		this.client.emit(
			Events.Log,
			`${msg.author.username}[${msg.author.id}] opened ${quantity} ${clueTier.name} caskets.`
		);

		const previousCL = msg.author.cl();
		await msg.author.addItemsToBank({ items: loot, collectionLog: true });
		if (loot.has(COINS_ID)) {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceOpen, loot.amount(COINS_ID));
		}

		await msg.author.incrementClueScore(clueTier.id, quantity);
		await msg.author.incrementOpenableScore(clueTier.id, quantity);

		if (mimicNumber > 0) {
			await msg.author.incrementMonsterScore(MIMIC_MONSTER_ID, mimicNumber);
		}

		return msg.channel.sendBankImage({
			bank: loot,
			content: `You have completed ${nthCasket} ${clueTier.name.toLowerCase()} Treasure Trails.${
				extraClueRolls > 0
					? ` You also received ${extraClueRolls} extra roll${
							extraClueRolls > 1 ? 's' : ''
					  } from your casket${quantity > 1 ? 's' : ''}!`
					: ''
			}`,
			title: opened,
			flags: { showNewCL: 1, wide: Object.keys(loot).length > 250 ? 1 : 0, ...msg.flagArgs },
			user: msg.author,
			cl: previousCL
		});
	}

	async osjsOpenablesOpen(msg: KlasaMessage, quantity: number, osjsOpenable: Openable) {
		if (osjsOpenable.name === 'Seed pack') {
			return this.client.commands.get('sp')!.run(msg, [quantity]);
		}

		if (msg.author.bank().amount(osjsOpenable.id) < quantity) {
			return msg.channel.send(
				`You don't have enough ${osjsOpenable.name} to open!\n\n However... ${await this.showAvailable(msg)}`
			);
		}

		await msg.author.removeItemsFromBank(new Bank().add(osjsOpenable.id, quantity));

		const loot = new Bank(osjsOpenable.open(quantity, {}));
		const score = msg.author.getOpenableScore(osjsOpenable.id) + quantity;
		this.client.emit(
			Events.Log,
			`${msg.author.username}[${msg.author.id}] opened ${quantity} ${osjsOpenable.name}.`
		);

		msg.author.incrementOpenableScore(osjsOpenable.id, quantity);
		const previousCL = msg.author.cl();
		await msg.author.addItemsToBank({ items: loot, collectionLog: true });
		if (loot.has(COINS_ID)) {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceOpen, loot.amount(COINS_ID));
		}

		return msg.channel.sendBankImage({
			bank: loot,
			content: `You have opened the ${osjsOpenable.name.toLowerCase()} ${score.toLocaleString()} times.`,
			title: `You opened ${quantity} ${osjsOpenable.name}`,
			flags: { showNewCL: 1, ...msg.flagArgs },
			user: msg.author,
			cl: previousCL
		});
	}

	async botOpenablesOpen(msg: KlasaMessage, quantity: number, name: string) {
		const botOpenable = botOpenables.find(thing => thing.aliases.some(alias => stringMatches(alias, name)));

		if (!botOpenable) {
			return msg.channel.send(
				`That's not a valid item you can open, you can open a clue casket (${ClueTiers.map(
					tier => tier.name
				).join(', ')}), or a non-clue item (${botOpenables
					.map(thing => thing.name)
					.concat(Openables.map(thing => thing.name))
					.join(', ')})`
			);
		}

		if (msg.author.bank().amount(botOpenable.itemID) < quantity) {
			return msg.channel.send(
				`You don't have enough ${botOpenable.name} to open!\n\n However... ${await this.showAvailable(msg)}`
			);
		}

		await msg.author.removeItemsFromBank(new Bank().add(botOpenable.itemID, quantity));

		const hasSmokey = msg.author.allItemsOwned().has('Smokey');
		const loot = new Bank();
		let smokeyBonus = 0;
		const isMysteryBox = itemsThatDontAddToTempCL.includes(botOpenable.itemID);
		if (isMysteryBox) {
			// Force names to TMBs/UMBs
			if (isMysteryBox && !Boolean(msg.flagArgs.id)) {
				msg.flagArgs.names = 'yes';
			}
			if (hasSmokey) {
				for (let i = 0; i < quantity; i++) {
					if (roll(10)) smokeyBonus++;
				}
			}
		}

		for (let i = 0; i < quantity + smokeyBonus; i++) {
			if (botOpenable.name === 'Pet Mystery box' && msg.author.isIronman) {
				loot.add(IronmanPMBTable.roll());
			} else if (typeof botOpenable.table === 'function') {
				loot.add(botOpenable.table());
			} else {
				loot.add(botOpenable.table.roll());
			}
		}

		const score = msg.author.getOpenableScore(botOpenable.itemID);
		const nthOpenable = formatOrdinal(score + randInt(1, quantity));

		if (botOpenable.itemID === itemID('Bag full of gems') && loot.has('Uncut onyx')) {
			this.client.emit(
				Events.ServerNotification,
				`${msg.author} just received an Uncut Onyx from their ${nthOpenable} Bag full of gems!`
			);
		}

		msg.author.incrementOpenableScore(botOpenable.itemID, quantity);
		const previousCL = msg.author.cl();
		await msg.author.addItemsToBank({
			items: loot,
			collectionLog: true,
			filterLoot: false,
			dontAddToTempCL: isMysteryBox
		});
		if (loot.amount('Coins') > 0) {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceOpen, loot.amount('Coins'));
		}

		if (loot.has('Mr. E')) {
			const usersWith = await countUsersWithItemInCl(itemID('Mr. E'), false);
			const ironmenWith = msg.author.isIronman ? await countUsersWithItemInCl(itemID('Mr. E'), true) : null;
			const amountOwned = formatOrdinal(msg.author.cl().amount('Mr. E'));
			this.client.emit(
				Events.ServerNotification,
				`<:MrE:918888222417887352> **${
					msg.author.username
				}** just received their ${amountOwned} Mr. E from their ${nthOpenable} ${botOpenable.name}!${
					previousCL.has('Mr. E')
						? ''
						: ` They are the ${formatOrdinal(usersWith)} person to get one${
								ironmenWith === null ? '' : `, and the ${formatOrdinal(ironmenWith)} ironman to get one`
						  }.`
				}`
			);
		}

		return msg.channel.sendBankImage({
			bank: loot,
			content: `You have opened the ${botOpenable.name.toLowerCase()} ${(
				score + quantity
			).toLocaleString()} times. ${
				hasSmokey && smokeyBonus > 0 ? `You got ${smokeyBonus}x bonus rolls from Smokey.` : ''
			}`,
			title: `You opened ${quantity} ${botOpenable.name}`,
			flags: {
				showNewCL: 1,
				wide: Object.keys(loot.values()).length > 250 ? 1 : 0,
				...msg.flagArgs
			},
			user: msg.author,
			cl: previousCL
		});
	}
}
