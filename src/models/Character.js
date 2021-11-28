import Ability from './Ability'
import ArmorClass from './ArmorClass'
import Attack from './Attack'
import GrappleModifier from './GrappleModifier'
import HitPoint from './HitPoint'
import Initiative from './Initiative'
import Load from './Load'
import Money from './Money'
import Posession from './Posession'
import ProtectiveItem from './ProtectiveItem'
import ProtectiveItemsTotal from './ProtectiveItemsTotal'
import SavingThrow from './SavingThrow'
import { INITIAL_SKILLS } from './Skill'

class Character {
  constructor() {
    this.id = ''
    this.image = ''
    this.tags = []
    this.pcName = ''
    this.alignment = ''
    this.plName = ''
    this.updateTime = new Date()
    this.classLevel = ''
    this.deity = ''
    this.race = ''
    this.size = ''
    this.gender = ''
    this.age = ''
    this.height = ''
    this.weight = ''
    this.hairColor = ''
    this.eyeColor = ''
    this.skinColor = ''
    this.memo = ''
    this.abilities = [
      new Ability('筋力'),
      new Ability('敏捷力'),
      new Ability('耐久力'),
      new Ability('知力'),
      new Ability('判断力'),
      new Ability('魅力'),
    ]
    this.hitPoint = new HitPoint('', '', '', '')
    this.initiative = new Initiative('', '', '')
    this.ac = new ArmorClass('', '', '', '', '', '', '', '', '', '', '', '', '')
    this.savingThrows = [
      new SavingThrow('頑健【耐久力】', '', '', '', '', '', ''),
      new SavingThrow('反応【敏捷力】', '', '', '', '', '', ''),
      new SavingThrow('意志【判断力】', '', '', '', '', '', ''),
    ]
    this.savingThrowConditionalModifier = ''
    this.bab = ''
    this.spellResistance = ''
    this.grappleModifier = new GrappleModifier('', '', '', '', '')
    this.attacks = []
    for (let i = 0; i < 6; i++) {
      this.attacks.push(new Attack('', '', '', '', '', '', '', ''))
    }
    this.speed = ''
    this.skills = INITIAL_SKILLS
    this.protectiveItems = []
    for (let i = 0; i < 10; i++) {
      this.protectiveItems.push(new ProtectiveItem('', '', '', '', '', '', '', ''))
    }
    this.protectiveItemsTotal = new ProtectiveItemsTotal('', '', '', '', '', '')
    this.posessions = []
    for (let i = 0; i < 30; i++) {
      this.posessions.push(new Posession('', ''))
    }
    this.totalWeightCarried = ''
    this.feat = ''
    this.specialAbility = ''
    this.language = ''
    this.experiencePoint = ''
    this.spell = ''
    this.money = new Money('', '', '', '')
    this.load = new Load('', '', '', '', '', '')
    this.setting = ''
    this.password = ''
    this.passwordConfirm = ''
    this.passwordForUpdate = ''
  }
}

export default Character
