import { v4 as uuidv4 } from 'uuid'

export class Skill {
  id: string
  classSkill: boolean
  name: string
  usableUntrained: boolean
  hasArmorPenalty: boolean
  subName: string
  hasSubName: boolean
  ability: string
  skillModifier: string
  abilityModifier: string
  ranks: string
  penalty: string
  miscModifier: string
  fullEditable: boolean
  constructor(name: string,
    ability: string,
    usableUntrained = true,
    hasArmorPenalty = false,
    hasSubName = false,
    fullEditable = false) {
      this.id = uuidv4()
      this.classSkill = false
      this.name = name
      this.usableUntrained = usableUntrained
      this.hasArmorPenalty = hasArmorPenalty
      this.subName = ''
      this.hasSubName = hasSubName
      this.ability = ability
      this.skillModifier = ''
      this.abilityModifier = ''
      this.ranks = ''
      this.penalty = ''
      this.miscModifier = ''
      this.fullEditable = fullEditable
    }
}

export const INITIAL_SKILLS = [
  new Skill('威圧', '【魅】'),
  new Skill('解錠', '【敏】', false),
  new Skill('解読', '【知】', false),
  new Skill('隠れ身', '【敏】', true, true),
  new Skill('軽業', '【敏】', false, true),
  new Skill('鑑定', '【知】'),
  new Skill('聞き耳', '【判】'),
  new Skill('騎乗', '【敏】'),
  new Skill('偽造', '【知】'),
  new Skill('芸能', '【魅】', false, false, true),
  new Skill('芸能', '【魅】', false, false, true),
  new Skill('芸能', '【魅】', false, false, true),
  new Skill('交渉', '【魅】'),
  new Skill('視認', '【判】'),
  new Skill('忍び足', '【敏】', true, true),
  new Skill('呪文学', '【知】', false),
  new Skill('情報収集', '【魅】'),
  new Skill('職能', '【判】', false, false, true),
  new Skill('職能', '【判】', false, false, true),
  new Skill('真意看破', '【判】'),
  new Skill('水泳', '【筋】', true, true),
  new Skill('製作', '【知】', true, false, true),
  new Skill('製作', '【知】', true, false, true),
  new Skill('製作', '【知】', true, false, true),
  new Skill('精神集中', '【耐】'),
  new Skill('生存', '【判】'),
  new Skill('捜索', '【知】'),
  new Skill('装置無力化', '【知】', false),
  new Skill('脱出術', '【敏】', true, true),
  new Skill('知識:貴族および王族', '【知】', false),
  new Skill('知識:建築術および工学', '【知】', false),
  new Skill('知識:次元界', '【知】', false),
  new Skill('知識:自然', '【知】', false),
  new Skill('知識:宗教', '【知】', false),
  new Skill('知識:神秘学', '【知】', false),
  new Skill('知識:ダンジョン探検', '【知】', false),
  new Skill('知識:地域', '【知】', false),
  new Skill('知識:地理学', '【知】', false),
  new Skill('知識:歴史学', '【知】', false),
  new Skill('跳躍', '【筋】', true, true),
  new Skill('治療', '【判】'),
  new Skill('手先の早業', '【敏】', false, true),
  new Skill('登攀', '【筋】', true, true),
  new Skill('動物使い', '【魅】', false),
  new Skill('縄使い', '【敏】'),
  new Skill('はったり', '【魅】'),
  new Skill('平衡感覚', '【敏】', true, true),
  new Skill('変装', '【魅】'),
  new Skill('魔法装置使用', '【魅】', false),
  new Skill('', '', false, false, false, true),
  new Skill('', '', false, false, false, true),
  new Skill('', '', false, false, false, true),
]

export default Skill
