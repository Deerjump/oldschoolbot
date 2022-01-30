import { Item } from 'oldschooljs/dist/meta/types';

import getOSItem from '../util/getOSItem';
import itemID from '../util/itemID';
import { SkillsEnum } from './types';

interface Skillcape {
	skill: SkillsEnum;
	hood: number;
	untrimmed: number;
	trimmed: number;
}

const Skillcapes: Skillcape[] = [
	{
		skill: SkillsEnum.Mining,
		hood: itemID('Mining hood'),
		untrimmed: itemID('Mining cape'),
		trimmed: itemID('Mining cape(t)')
	},
	{
		skill: SkillsEnum.Smithing,
		hood: itemID('Smithing hood'),
		untrimmed: itemID('Smithing cape'),
		trimmed: itemID('Smithing cape(t)')
	},
	{
		skill: SkillsEnum.Woodcutting,
		hood: itemID('Woodcutting hood'),
		untrimmed: itemID('Woodcutting cape'),
		trimmed: itemID('Woodcut. cape(t)')
	},
	{
		skill: SkillsEnum.Firemaking,
		hood: itemID('Firemaking hood'),
		untrimmed: itemID('Firemaking cape'),
		trimmed: itemID('Firemaking cape(t)')
	},
	{
		skill: SkillsEnum.Agility,
		hood: itemID('Agility hood'),
		untrimmed: itemID('Agility cape'),
		trimmed: itemID('Agility cape(t)')
	},
	{
		skill: SkillsEnum.Fishing,
		hood: itemID('Fishing hood'),
		untrimmed: itemID('Fishing cape'),
		trimmed: itemID('Fishing cape(t)')
	},
	{
		skill: SkillsEnum.Runecraft,
		hood: itemID('Runecraft hood'),
		untrimmed: itemID('Runecraft cape'),
		trimmed: itemID('Runecraft cape(t)')
	},
	{
		skill: SkillsEnum.Cooking,
		hood: itemID('Cooking hood'),
		untrimmed: itemID('Cooking cape'),
		trimmed: itemID('Cooking cape(t)')
	},
	{
		skill: SkillsEnum.Crafting,
		hood: itemID('Crafting hood'),
		untrimmed: itemID('Crafting cape'),
		trimmed: itemID('Crafting cape(t)')
	},
	{
		skill: SkillsEnum.Prayer,
		hood: itemID('Prayer hood'),
		untrimmed: itemID('Prayer cape'),
		trimmed: itemID('Prayer cape(t)')
	},
	{
		skill: SkillsEnum.Fletching,
		hood: itemID('Fletching hood'),
		untrimmed: itemID('Fletching cape'),
		trimmed: itemID('Fletching cape(t)')
	},
	{
		skill: SkillsEnum.Thieving,
		hood: itemID('Thieving hood'),
		untrimmed: itemID('Thieving cape'),
		trimmed: itemID('Thieving cape(t)')
	},
	{
		skill: SkillsEnum.Farming,
		hood: itemID('Farming hood'),
		untrimmed: itemID('Farming cape'),
		trimmed: itemID('Farming cape(t)')
	},
	{
		skill: SkillsEnum.Herblore,
		hood: itemID('Herblore hood'),
		untrimmed: itemID('Herblore cape'),
		trimmed: itemID('Herblore cape(t)')
	},
	{
		skill: SkillsEnum.Hunter,
		hood: itemID('Hunter hood'),
		untrimmed: itemID('Hunter cape'),
		trimmed: itemID('Hunter cape(t)')
	},
	{
		skill: SkillsEnum.Construction,
		hood: itemID('Construct. hood'),
		untrimmed: itemID('Construct. cape'),
		trimmed: itemID('Construct. cape(t)')
	},
	{
		skill: SkillsEnum.Magic,
		hood: itemID('Magic hood'),
		untrimmed: itemID('Magic cape'),
		trimmed: itemID('Magic cape(t)')
	},
	{
		skill: SkillsEnum.Attack,
		hood: itemID('Attack hood'),
		untrimmed: itemID('Attack cape'),
		trimmed: itemID('Attack cape(t)')
	},
	{
		skill: SkillsEnum.Strength,
		hood: itemID('Strength hood'),
		untrimmed: itemID('Strength cape'),
		trimmed: itemID('Strength cape(t)')
	},
	{
		skill: SkillsEnum.Defence,
		hood: itemID('Defence hood'),
		untrimmed: itemID('Defence cape'),
		trimmed: itemID('Defence cape(t)')
	},
	{
		skill: SkillsEnum.Ranged,
		hood: itemID('Ranging hood'),
		untrimmed: itemID('Ranging cape'),
		trimmed: itemID('Ranging cape(t)')
	},
	{
		skill: SkillsEnum.Hitpoints,
		hood: itemID('Hitpoints hood'),
		untrimmed: itemID('Hitpoints cape'),
		trimmed: itemID('Hitpoints cape(t)')
	},
	{
		skill: SkillsEnum.Dungeoneering,
		hood: itemID('Dungeoneering hood'),
		untrimmed: itemID('Dungeoneering cape'),
		trimmed: itemID('Dungeoneering cape(t)')
	},
	{
		skill: SkillsEnum.Slayer,
		hood: itemID('Slayer hood'),
		untrimmed: itemID('Slayer cape'),
		trimmed: itemID('Slayer cape(t)')
	},
	{
		skill: SkillsEnum.Invention,
		hood: itemID('Invention hood'),
		untrimmed: itemID('Invention cape'),
		trimmed: itemID('Invention cape(t)')
	}
];

interface MasterSkillcape {
	skill: SkillsEnum;
	item: Item;
}

export const MasterSkillcapes: MasterSkillcape[] = [
	{
		skill: SkillsEnum.Mining,
		item: getOSItem('Mining master cape')
	},
	{
		skill: SkillsEnum.Smithing,
		item: getOSItem('Smithing master cape')
	},
	{
		skill: SkillsEnum.Woodcutting,
		item: getOSItem('Woodcutting master cape')
	},
	{
		skill: SkillsEnum.Firemaking,
		item: getOSItem('Firemaking master cape')
	},
	{
		skill: SkillsEnum.Agility,
		item: getOSItem('Agility master cape')
	},
	{
		skill: SkillsEnum.Fishing,
		item: getOSItem('Fishing master cape')
	},
	{
		skill: SkillsEnum.Runecraft,
		item: getOSItem('Runecraft master cape')
	},
	{
		skill: SkillsEnum.Cooking,
		item: getOSItem('Cooking master cape')
	},
	{
		skill: SkillsEnum.Crafting,
		item: getOSItem('Crafting master cape')
	},
	{
		skill: SkillsEnum.Prayer,
		item: getOSItem('Prayer master cape')
	},
	{
		skill: SkillsEnum.Fletching,
		item: getOSItem('Fletching master cape')
	},
	{
		skill: SkillsEnum.Thieving,
		item: getOSItem('Thieving master cape')
	},
	{
		skill: SkillsEnum.Farming,
		item: getOSItem('Farming master cape')
	},
	{
		skill: SkillsEnum.Herblore,
		item: getOSItem('Herblore master cape')
	},
	{
		skill: SkillsEnum.Hunter,
		item: getOSItem('Hunter master cape')
	},
	{
		skill: SkillsEnum.Construction,
		item: getOSItem('Construction master cape')
	},
	{
		skill: SkillsEnum.Magic,
		item: getOSItem('Magic master cape')
	},
	{
		skill: SkillsEnum.Hitpoints,
		item: getOSItem('Hitpoints master cape')
	},
	{
		skill: SkillsEnum.Ranged,
		item: getOSItem('Ranged master cape')
	},
	{
		skill: SkillsEnum.Attack,
		item: getOSItem('Attack master cape')
	},
	{
		skill: SkillsEnum.Strength,
		item: getOSItem('Strength master cape')
	},
	{
		skill: SkillsEnum.Defence,
		item: getOSItem('Defence master cape')
	},
	{
		skill: SkillsEnum.Dungeoneering,
		item: getOSItem('Dungeoneering master cape')
	},
	{
		skill: SkillsEnum.Slayer,
		item: getOSItem('Slayer master cape')
	},
	{
		skill: SkillsEnum.Invention,
		item: getOSItem('Invention master cape')
	}
];

export default Skillcapes;
