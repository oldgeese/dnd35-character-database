import { Character } from '../models'
const ABILITY_POSITION: { [s:string]: number } = {
  '【筋】': 0,
  '【敏】': 1,
  '【耐】': 2,
  '【知】': 3,
  '【判】': 4,
  '【魅】': 5,
}

const ST_CORRESPONTING_ABILITY: { [s:string]: string }= {
  '頑健【耐久力】': '【耐】',
  '反応【敏捷力】': '【敏】',
  '意志【判断力】': '【判】',
}

export const getSTCorrespondingAbility = (name: string) => ST_CORRESPONTING_ABILITY[name]
export const getAbilityPosition = (ability: string) => ABILITY_POSITION[ability]

export const calcModifier = (xs: string[]) => Math.floor((Number(xs[0]) - 10) / 2)
export const calcArmorClass = (xs: string[]) => xs.reduce((acc, cur) => Number(acc) + Number(cur), 10)
export const calcInitiative = ([dex, misc]: [string, string]) => calcModifier([dex]) + Number(misc)
export const calcSavingThrow = ([base, dex, magic, misc, temp]: [string, string, string, string, string]) => Number(base)
  + calcModifier([dex]) + Number(magic) + Number(misc) + Number(temp)
export const calcGrappleModifier = ([bab, str, size, misc]: [string, string, string, string]) => Number(bab) + calcModifier([str])
  + Number(size) + Number(misc)
export const calcSkillModifier = ([ability, rank, penalty, misc]: [string, string, string, string]) => calcModifier([ability])
  + Number(rank) + Number(penalty) + Number(misc)

export const getHomeTitle = () => 'D&D 3.5版 キャラクターデータベース'
export const getTitle = (char: Character) => ( char.pcName === '' ? '名前なし' : char.pcName ) + ' - ' + getHomeTitle()
