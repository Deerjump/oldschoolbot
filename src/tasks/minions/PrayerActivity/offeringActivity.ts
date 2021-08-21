import { Task } from 'klasa';

import Prayer from '../../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../../lib/skilling/types';
import { OfferingActivityTaskOptions } from '../../../lib/types/minions';
import { itemID, rand, roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: OfferingActivityTaskOptions) {
		const { boneID, quantity, userID, channelID } = data;
		const user = await this.client.fetchUser(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Prayer);

		const bone = Prayer.Bones.find(bone => bone.inputId === boneID);

		const XPMod = 3.5;
		let bonesLost = 0;
		if (!bone) return;

		// make it so you can't lose more bones then you bring
		let maxPK = quantity;
		if (quantity >= 27) {
			maxPK = 27;
		}

		const trips = Math.ceil(quantity / 27);
		let deathCounter = 0;
		// roll a 10% chance to get pked per trip
		for (let i = 0; i < trips; i++) {
			if (roll(10)) {
				deathCounter++;
			}
		}
		// calc how many bones are lost
		for (let i = 0; i < deathCounter; i++) {
			bonesLost += rand(1, maxPK);
		}
		const bonesSaved = Math.floor(quantity * (rand(90, 110) / 100));
		const newQuantity = quantity - bonesLost + bonesSaved;

		let xpReceived = newQuantity * bone.xp * XPMod;
		const bonusXP = xpReceived * rand(2, 4) - xpReceived;
		if (user.equippedPet() === itemID('Lil Lamb')) {
			xpReceived += bonusXP;
		}

		await user.addXP({ skillName: SkillsEnum.Prayer, amount: xpReceived });
		const newLevel = user.skillLevel(SkillsEnum.Prayer);

		let str = `${user}, ${user.minionName} finished offering ${newQuantity} ${
			bone.name
		}, you managed to offer ${bonesSaved} extra bones because of the effects the Chaos altar and you lost ${bonesLost} to pkers, you also received ${xpReceived.toLocaleString()} XP. ${
			user.equippedPet() === itemID('Lil Lamb')
				? `The RuneScape gods bless you with ${bonusXP.toLocaleString()} extra XP for you raising the young lamb.`
				: ''
		}`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Prayer level is now ${newLevel}!`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${bone.name}[${bone.inputId}]`);
				return this.client.commands.get('offer')!.run(res, [quantity, bone.name]);
			},
			undefined,
			data,
			null
		);
	}
}
