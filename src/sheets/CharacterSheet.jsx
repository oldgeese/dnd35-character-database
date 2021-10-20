import { Box, Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import RemoveIcon from '@material-ui/icons/Remove'
import StopIcon from '@material-ui/icons/Stop'
import { FieldArray } from 'formik'
import React from 'react'

import {
  BooleanValue,
  ComputeValue,
  DateValue,
  ImageValue,
  Label,
  Label2,
  MultiLineValue,
  SkillAbilityValue,
  SkillNameValue,
  Value,
} from '../components'
import {
  Posession,
} from '../models'
import {
  calcArmorClass,
  calcGrappleModifier,
  calcInitiative,
  calcModifier,
  calcSavingThrow,
  calcSkillModifier,
  getAbilityPosition,
  getSTCorrespondingAbility,
} from '../utils'

const useStyles = makeStyles({
  bgblack: {
    background: 'black',
    color: 'white',
  },
  bgslightgray: {
    background: 'rgb(248,248,248)',
  },
  acGridWidth: {
    flexGrow: 0,
    maxWidth: '7.3%',
    flexBasis: '7.3%',
  },
})

const CharacterSheet = ({ input, values, ...props }) => {
  const classes = useStyles()
  return (
    <div className={input ? classes.bgslightgray : ''}>
      <Grid container item xs={12} spacing={1}>
        <Grid container item xs={3}>
          <ImageValue name="image" input={input} {...props} />
        </Grid>
        <Grid container item xs={9}>
          <Grid container item xs={12} spacing={1}>
            <Grid container item xs={12}>
              <Label>タグ</Label>
              <Value name="tags" input={input} {...props} />
            </Grid>
          </Grid>
          <Grid container item xs={12} spacing={1}>
            <Grid container item xs={3}>
              <Label>キャラクター名</Label>
              <Value name="pcName" input={input} {...props} />
            </Grid>
            <Grid container item xs={3}>
              <Label>属性</Label>
              <Value name="alignment" input={input} {...props} />
            </Grid>
            <Grid container item xs={3}>
              <Label>プレイヤー名</Label>
              <Value name="plName" input={input} {...props} />
            </Grid>
            <Grid container item xs={3}>
              <Label>最終更新</Label>
              <DateValue name="updateTime" input={input} {...props} />
            </Grid>
          </Grid>
          <Grid container item xs={12} spacing={1}>
            <Grid container item xs={9}>
              <Label>クラス/キャラクターレベル</Label>
              <Value name="classLevel" input={input} {...props} />
            </Grid>
            <Grid container item xs={3}>
              <Label>信仰する神</Label>
              <Value name="deity" input={input} {...props} />
            </Grid>
          </Grid>
          <Grid container item xs={12} spacing={1}>
            <Grid container item xs={2}>
              <Label>種族</Label>
              <Value name="race" input={input} {...props} />
            </Grid>
            <Grid container item xs={2}>
              <Label>サイズ</Label>
              <Value name="size" input={input} {...props} />
            </Grid>
            <Grid container item xs={2}>
              <Label>性別</Label>
              <Value name="gender" input={input} {...props} />
            </Grid>
            <Grid container item xs={2}>
              <Label>年齢</Label>
              <Value name="age" input={input} {...props} />
            </Grid>
            <Grid container item xs={2}>
              <Label>身長</Label>
              <Value name="height" input={input} {...props} />
            </Grid>
            <Grid container item xs={2}>
              <Label>体重</Label>
              <Value name="weight" input={input} {...props} />
            </Grid>
          </Grid>
          <Grid container item xs={12} spacing={1}>
            <Grid container item xs={4}>
              <Label>髪の色</Label>
              <Value name="hairColor" input={input} {...props} />
            </Grid>
            <Grid container item xs={4}>
              <Label>瞳の色</Label>
              <Value name="eyeColor" input={input} {...props} />
            </Grid>
            <Grid container item xs={4}>
              <Label>肌の色</Label>
              <Value name="skinColor" input={input} {...props} />
            </Grid>
          </Grid>
          <Grid container item xs={12} spacing={1}>
            <Grid container item xs={12}>
              <Label>メモ欄</Label>
              <Value name="memo" input={input} {...props} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={1} alignItems="flex-start">
        <Grid container item xs={6} spacing={1}>
          <Grid container item xs={6} spacing={1}>
            <Grid container item xs={12}>
              <Grid container item xs={3} justify="center" alignItems="flex-end">
                <Label align="center">能力名</Label>
              </Grid>
              <Grid container item xs={3} justify="center" alignItems="flex-end">
                <Label align="center">能力値</Label>
              </Grid>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">
                  能力
                  <br />
                  修正値
                </Label>
              </Grid>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">
                  一時的
                  <br />
                  能力値
                </Label>
              </Grid>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">
                  一時的
                  <br />
                  修正値
                </Label>
              </Grid>
              {values.abilities.map((row, index) => (
                <Grid container item key={row.id} spacing={1}>
                  <Grid container item xs={3} justify="center" alignItems="center">
                    <Label2 align="center" className={classes.bgblack}>{row.name}</Label2>
                  </Grid>
                  <Grid container item xs={3} justify="center" alignItems="center">
                    <Value name={`abilities.${index}.score`} input={input} {...props} align="center" />
                  </Grid>
                  <Grid container item xs={2} justify="center" alignItems="center">
                    <ComputeValue
                      name={`abilities.${index}.modifier`}
                      input={input}
                      subscribe={`abilities.${index}.score`}
                      compute={calcModifier}
                      {...props}
                      align="center"
                    />
                  </Grid>
                  <Grid container item xs={2} justify="center" alignItems="center">
                    <Value name={`abilities.${index}.temporaryScore`} input={input} {...props} align="center" />
                  </Grid>
                  <Grid container item xs={2} justify="center" alignItems="center">
                    <Value name={`abilities.${index}.temporaryModifier`} input={input} {...props} align="center" />
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid container item xs={6} spacing={1}>
            <Grid item xs={12} />
            <Grid container item xs={12} spacing={1}>
              <Grid container item xs={4} justify="center" alignItems="flex-end" />
              <Grid container item xs={4} justify="center" alignItems="flex-end">
                <Label>最大値</Label>
              </Grid>
              <Grid container item xs={4} justify="center" alignItems="flex-end">
                <Label>ダメージ減少</Label>
              </Grid>
              <Grid container item xs={4} justify="center" alignItems="center">
                <Label2 align="center" className={classes.bgblack}>HP</Label2>
              </Grid>
              <Grid container item xs={4} justify="center" alignItems="center">
                <Value name="hitPoint.total" input={input} {...props} align="center" />
              </Grid>
              <Grid container item xs={4} justify="center" alignItems="center">
                <Value name="hitPoint.damageReduction" input={input} {...props} align="center" />
              </Grid>
              <Grid container item xs={12} spacing={1}>
                <Label>負傷/現在のHP</Label>
                <Value name="hitPoint.current" input={input} {...props} />
              </Grid>
              <Grid container item xs={12} spacing={1}>
                <Label>非致傷ダメージ</Label>
                <Value name="hitPoint.nonlethalDamage" input={input} {...props} />
              </Grid>
            </Grid>
            <Grid container item xs={4} justify="center" alignItems="center">
              <Label2 align="center" className={classes.bgblack}>
                イニシアチブ
                <br />
                修正値
              </Label2>
            </Grid>
            <Grid container item xs={8}>
              <Grid container item xs={4} justify="center">
                <Grid container item xs={9}>
                  <ComputeValue
                    name="initiative.total"
                    input={input}
                    subscribe="abilities.1.score,initiative.miscModifier"
                    compute={calcInitiative}
                    {...props}
                    align="center"
                  />
                </Grid>
                <Grid container item xs={3} justify="center">
                  <Label align="center">=</Label>
                </Grid>
              </Grid>
              <Grid container item xs={4} justify="center">
                <Grid container item xs={9}>
                  <ComputeValue
                    name="initiative.dexModifier"
                    input={input}
                    subscribe={`abilities.${getAbilityPosition('【敏】')}.score`}
                    compute={calcModifier}
                    {...props}
                    align="center"
                  />
                </Grid>
                <Grid container item xs={3} justify="center">
                  <Label align="center">+</Label>
                </Grid>
              </Grid>
              <Grid container item xs={4} justify="center">
                <Value name="initiative.miscModifier" input={input} {...props} align="center" />
              </Grid>
              <Grid container item xs={4} justify="center" alignItems="flex-start">
                <Label align="center">合計</Label>
              </Grid>
              <Grid container item xs={4} justify="center" alignItems="flex-start">
                <Label align="center">
                  【敏】
                  <br />
                  修正値
                </Label>
              </Grid>
              <Grid container item xs={4} justify="center" alignItems="flex-start">
                <Label align="center">
                  その他の
                  <br />
                  修正値
                </Label>
              </Grid>
            </Grid>
          </Grid>
          <Grid container item xs={12} spacing={1}>
            <Grid container item xs={1} justify="center" alignItems="center">
              <Label2 align="center" className={classes.bgblack}>AC</Label2>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="center">
              <Grid container item xs={9}>
                <ComputeValue
                  name="ac.total"
                  input={input}
                  subscribe="ac.armorBonus,ac.shieldBonus,ac.dexModifier,ac.sizeModifier,ac.naturalArmor,ac.deflectionBonus,ac.luckBonus,ac.insightBonus,ac.moraleBonus,ac.miscModifier"
                  compute={calcArmorClass}
                  {...props}
                  align="center"
                />
              </Grid>
              <Grid container item xs={3} justify="center">
                <Label align="center">=</Label>
              </Grid>
            </Grid>
            <Grid container item xs={1} justify="center" alignItems="center">
              <Grid container item xs={6}>
                <Label align="center">10</Label>
              </Grid>
              <Grid container item xs={6} justify="center">
                <Label align="center">+</Label>
              </Grid>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="center">
              <Grid container item xs={9}>
                <Value name="ac.armorBonus" input={input} {...props} align="center" />
              </Grid>
              <Grid container item xs={3} justify="center">
                <Label align="center">+</Label>
              </Grid>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="center">
              <Grid container item xs={9}>
                <Value name="ac.shieldBonus" input={input} {...props} align="center" />
              </Grid>
              <Grid container item xs={3} justify="center">
                <Label align="center">+</Label>
              </Grid>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="center">
              <Grid container item xs={9}>
                <Value name="ac.dexModifier" input={input} {...props} align="center" />
              </Grid>
              <Grid container item xs={3} justify="center">
                <Label align="center">+</Label>
              </Grid>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="center">
              <Grid container item xs={9}>
                <Value name="ac.sizeModifier" input={input} {...props} align="center" />
              </Grid>
              <Grid container item xs={3} justify="center">
                <Label align="center">+</Label>
              </Grid>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="center">
              <Grid container item xs={9}>
                <Value name="ac.naturalArmor" input={input} {...props} align="center" />
              </Grid>
              <Grid container item xs={3} justify="center">
                <Label align="center">+</Label>
              </Grid>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="center">
              <Grid container item xs={9}>
                <Value name="ac.deflectionBonus" input={input} {...props} align="center" />
              </Grid>
              <Grid container item xs={3} justify="center">
                <Label align="center">+</Label>
              </Grid>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="center">
              <Grid container item xs={9}>
                <Value name="ac.luckBonus" input={input} {...props} align="center" />
              </Grid>
              <Grid container item xs={3} justify="center">
                <Label align="center">+</Label>
              </Grid>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="center">
              <Grid container item xs={9}>
                <Value name="ac.insightBonus" input={input} {...props} align="center" />
              </Grid>
              <Grid container item xs={3} justify="center">
                <Label align="center">+</Label>
              </Grid>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="center">
              <Grid container item xs={9}>
                <Value name="ac.moraleBonus" input={input} {...props} align="center" />
              </Grid>
              <Grid container item xs={3} justify="center">
                <Label align="center">+</Label>
              </Grid>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="center">
              <Grid container item xs={12}>
                <Value name="ac.miscModifier" input={input} {...props} align="center" />
              </Grid>
            </Grid>
            <Grid container item xs={1} justify="center" alignItems="center" />
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="flex-start">
              <Label align="center">合計</Label>
            </Grid>
            <Grid container item xs={1} justify="center" alignItems="center" />
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="flex-start">
              <Label align="center">
                鎧
                <br />
                ボーナス
              </Label>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="flex-start">
              <Label align="center">
                盾
                <br />
                ボーナス
              </Label>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="flex-start">
              <Label align="center">
                【敏】
                <br />
                修正値
              </Label>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="flex-start">
              <Label align="center">
                サイズ
                <br />
                修正値
              </Label>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="flex-start">
              <Label align="center">
                外皮
                <br />
                ボーナス
              </Label>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="flex-start">
              <Label align="center">
                反発
                <br />
                ボーナス
              </Label>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="flex-start">
              <Label align="center">
                幸運
                <br />
                ボーナス
              </Label>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="flex-start">
              <Label align="center">
                洞察
                <br />
                ボーナス
              </Label>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="flex-start">
              <Label align="center">
                士気
                <br />
                ボーナス
              </Label>
            </Grid>
            <Grid container item className={classes.acGridWidth} justify="center" alignItems="flex-start">
              <Label align="center">
                その他の
                <br />
                修正値
              </Label>
            </Grid>
          </Grid>
          <Grid container item xs={12} spacing={1}>
            <Grid container item xs={3} justify="center" alignItems="center">
              <Label2 align="center" className={classes.bgblack}>
                接触
                <br />
                アーマークラス
              </Label2>
            </Grid>
            <Grid container item xs={3} justify="center" alignItems="center">
              <Value name="ac.touchAc" input={input} {...props} align="center" />
            </Grid>
            <Grid container item xs={3} justify="center" alignItems="center">
              <Label2 align="center" className={classes.bgblack}>
                立ちすくみ
                <br />
                アーマークラス
              </Label2>
            </Grid>
            <Grid container item xs={3} justify="center" alignItems="center">
              <Value name="ac.flatFootedAc" input={input} {...props} align="center" />
            </Grid>
          </Grid>
          <Grid item xs={12} />
          <Grid container item xs={10} spacing={1}>
            <Grid container item xs={3}>
              <Grid container item xs={12} justify="center" alignItems="flex-end">
                <Label align="center">
                  セーヴィング
                  <br />
                  ・スロー
                </Label>
              </Grid>
            </Grid>
            <Grid container item xs={9}>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">合計</Label>
              </Grid>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">
                  基本
                  <br />
                  セーヴ
                </Label>
              </Grid>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">
                  能力
                  <br />
                  修正値
                </Label>
              </Grid>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">
                  魔法による
                  <br />
                  修正値
                </Label>
              </Grid>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">
                  その他
                  <br />
                  修正値
                </Label>
              </Grid>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">
                  一時的
                  <br />
                  修正値
                </Label>
              </Grid>
            </Grid>
            {values.savingThrows.map((row, index) => (
              <Grid container item key={row.id} spacing={1}>
                <Grid container item xs={3}>
                  <Grid container item xs={12} justify="center" alignItems="center">
                    <Label2 align="center" className={classes.bgblack}>{row.name}</Label2>
                  </Grid>
                </Grid>
                <Grid container item xs={9}>
                  <Grid container item xs={2} justify="center" alignItems="center">
                    <Grid item xs={8}>
                      <ComputeValue
                        name={`savingThrows.${index}.total`}
                        input={input}
                        subscribe={`savingThrows.${index}.baseSave,abilities.${getAbilityPosition(getSTCorrespondingAbility(row.name))}.score,savingThrows.${index}.magicModifier,savingThrows.${index}.miscModifier,savingThrows.${index}.temporaryModifier`}
                        compute={calcSavingThrow}
                        {...props}
                        align="center"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Label align="center">=</Label>
                    </Grid>
                  </Grid>
                  <Grid container item xs={2} justify="center" alignItems="center">
                    <Grid item xs={8}>
                      <Value name={`savingThrows.${index}.baseSave`} input={input} {...props} align="center" />
                    </Grid>
                    <Grid item xs={4}>
                      <Label align="center">+</Label>
                    </Grid>
                  </Grid>
                  <Grid container item xs={2} justify="center" alignItems="center">
                    <Grid item xs={8}>
                      <ComputeValue
                        name={`savingThrows.${index}.abilityModifier`}
                        input={input}
                        subscribe={`abilities.${getAbilityPosition(getSTCorrespondingAbility(row.name))}.score`}
                        compute={calcModifier}
                        {...props}
                        align="center"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Label align="center">+</Label>
                    </Grid>
                  </Grid>
                  <Grid container item xs={2} justify="center" alignItems="center">
                    <Grid item xs={9}>
                      <Value name={`savingThrows.${index}.magicModifier`} input={input} {...props} align="center" />
                    </Grid>
                    <Grid item xs={3}>
                      <Label align="center">+</Label>
                    </Grid>
                  </Grid>
                  <Grid container item xs={2} justify="center" alignItems="center">
                    <Grid item xs={9}>
                      <Value name={`savingThrows.${index}.miscModifier`} input={input} {...props} align="center" />
                    </Grid>
                    <Grid item xs={3}>
                      <Label align="center">+</Label>
                    </Grid>
                  </Grid>
                  <Grid container item xs={2} justify="center" alignItems="center">
                    <Grid item xs={12}>
                      <Value name={`savingThrows.${index}.temporaryModifier`} input={input} {...props} align="center" />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
          <Grid container item xs={2} spacing={1}>
            <Label>条件付きの修正値</Label>
            <MultiLineValue name="savingThrowConditionalModifier" input={input} {...props} align="center" style={{ height: '80%' }} />
          </Grid>
          <Grid item xs={12} />
          <Grid container item xs={12} spacing={1}>
            <Grid container item xs={3} justify="center" alignItems="center">
              <Label2 align="center" className={classes.bgblack}>基本攻撃ボーナス</Label2>
            </Grid>
            <Grid container item xs={4} justify="center" alignItems="center">
              <Value name="bab" input={input} {...props} align="center" />
            </Grid>
            <Grid container item xs={2} justify="center" alignItems="center">
              <Label2 align="center" className={classes.bgblack}>呪文抵抗</Label2>
            </Grid>
            <Grid container item xs={3} justify="center" alignItems="center">
              <Value name="spellResistance" input={input} {...props} align="center" />
            </Grid>
          </Grid>
          <Grid container item xs={12} spacing={1}>
            <Grid container item xs={3}>
              <Grid container item xs={12} justify="center" alignItems="center" />
            </Grid>
            <Grid container item xs={9}>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">合計</Label>
              </Grid>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">
                  基本攻撃
                  <br />
                  ボーナス
                </Label>
              </Grid>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">
                  【筋】
                  <br />
                  修正値
                </Label>
              </Grid>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">
                  サイズ
                  <br />
                  修正値
                </Label>
              </Grid>
              <Grid container item xs={2} justify="center" alignItems="flex-end">
                <Label align="center">
                  その他
                  <br />
                  修正値
                </Label>
              </Grid>
            </Grid>
            <Grid container item spacing={1}>
              <Grid container item xs={3}>
                <Grid container item xs={12} justify="center" alignItems="center">
                  <Label2 align="center" className={classes.bgblack}>組みつき修正値</Label2>
                </Grid>
              </Grid>
              <Grid container item xs={9}>
                <Grid container item xs={2} justify="center" alignItems="center">
                  <Grid item xs={8}>
                    <ComputeValue
                      name="grappleModifier.total"
                      input={input}
                      subscribe={`grappleModifier.bab,abilities.${getAbilityPosition('【筋】')}.score,grappleModifier.sizeModifier,grappleModifier.miscModifier`}
                      compute={calcGrappleModifier}
                      {...props}
                      align="center"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Label align="center">=</Label>
                  </Grid>
                </Grid>
                <Grid container item xs={2} justify="center" alignItems="center">
                  <Grid item xs={8}>
                    <Value name="grappleModifier.bab" input={input} {...props} align="center" />
                  </Grid>
                  <Grid item xs={4}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container item xs={2} justify="center" alignItems="center">
                  <Grid item xs={8}>
                    <ComputeValue
                      name="grappleModifier.strengthModifier"
                      input={input}
                      subscribe={`abilities.${getAbilityPosition('【筋】')}.score`}
                      compute={calcModifier}
                      {...props}
                      align="center"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container item xs={2} justify="center" alignItems="center">
                  <Grid item xs={9}>
                    <Value name="grappleModifier.sizeModifier" input={input} {...props} align="center" />
                  </Grid>
                  <Grid item xs={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container item xs={2} justify="center" alignItems="center">
                  <Grid item xs={12}>
                    <Value name="grappleModifier.miscModifier" input={input} {...props} align="center" />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            {values.attacks.map((row, index) => (
              <Grid container item key={row.id} spacing={1}>
                <Grid item xs={12} />
                <Grid item xs={12} />
                <Grid container item xs={6} justify="center" alignItems="center">
                  <Label2 align="center" className={classes.bgblack}>
                    攻撃
                    {index + 1}
                  </Label2>
                </Grid>
                <Grid container item xs={3} justify="center" alignItems="center">
                  <Label align="center" className={classes.bgblack}>攻撃ボーナス</Label>
                </Grid>
                <Grid container item xs={2} justify="center" alignItems="center">
                  <Label align="center" className={classes.bgblack}>クリティカル</Label>
                </Grid>
                <Grid container item xs={1} justify="center" alignItems="center">
                  <Label align="center" className={classes.bgblack}>重量</Label>
                </Grid>
                <Grid container item xs={6} justify="center" alignItems="center">
                  <Value name={`attacks.${index}.attack`} input={input} {...props} align="center" />
                </Grid>
                <Grid container item xs={3} justify="center" alignItems="center">
                  <Value name={`attacks.${index}.attackBonus`} input={input} {...props} align="center" />
                </Grid>
                <Grid container item xs={2} justify="center" alignItems="center">
                  <Value name={`attacks.${index}.critical`} input={input} {...props} align="center" />
                </Grid>
                <Grid container item xs={1} justify="center" alignItems="center">
                  <Value name={`attacks.${index}.weight`} input={input} {...props} align="center" />
                </Grid>
                <Grid container item xs={2} justify="center" alignItems="center">
                  <Label align="center" className={classes.bgblack}>タイプ</Label>
                </Grid>
                <Grid container item xs={1} justify="center" alignItems="center">
                  <Label align="center" className={classes.bgblack}>射程</Label>
                </Grid>
                <Grid container item xs={3} justify="center" alignItems="center">
                  <Label align="center" className={classes.bgblack}>その他・矢弾等</Label>
                </Grid>
                <Grid container item xs={6} justify="center" alignItems="center">
                  <Label align="center" className={classes.bgblack}>ダメージ</Label>
                </Grid>
                <Grid container item xs={2} justify="center" alignItems="center">
                  <Value name={`attacks.${index}.type`} input={input} {...props} align="center" />
                </Grid>
                <Grid container item xs={1} justify="center" alignItems="center">
                  <Value name={`attacks.${index}.range`} input={input} {...props} align="center" />
                </Grid>
                <Grid container item xs={3} justify="center" alignItems="center">
                  <Value name={`attacks.${index}.notes`} input={input} {...props} align="center" />
                </Grid>
                <Grid container item xs={6} justify="center" alignItems="center">
                  <Value name={`attacks.${index}.damage`} input={input} {...props} align="center" />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid container item xs={6} spacing={1}>
          <Grid container item xs={12} spacing={1}>
            <Grid container item xs={4} justify="center" alignItems="center">
              <Label2 align="center" className={classes.bgblack}>移動速度</Label2>
            </Grid>
            <Grid container item xs={8} justify="center" alignItems="center">
              <Value name="speed" input={input} {...props} align="center" />
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Grid container item xs={12} justify="center" alignItems="center">
              <Label2 align="center" className={classes.bgblack}>技能</Label2>
            </Grid>
            <Grid container item xs={1} justify="center" alignItems="center">
              <Label align="center">
                クラス
                <br />
                技能
              </Label>
            </Grid>
            <Grid container item xs={4} justify="center" alignItems="center">
              <Label align="center">技能名</Label>
            </Grid>
            <Grid container item xs={1} justify="center" alignItems="center">
              <Label align="center">
                対応
                <br />
                能力値
              </Label>
            </Grid>
            <Grid container item xs={1} justify="center" alignItems="center">
              <Label align="center">
                技能
                <br />
                修正値
              </Label>
            </Grid>
            <Grid container item xs={1} justify="center" alignItems="center">
              <Label align="center">
                能力
                <br />
                修正値
              </Label>
            </Grid>
            <Grid container item xs={1} justify="center" alignItems="center">
              <Label align="center">ランク</Label>
            </Grid>
            <Grid container item xs={1} justify="center" alignItems="center">
              <Label align="center">
                防具
                <br />
                による
                <br />
                ペナルティ
              </Label>
            </Grid>
            <Grid container item xs={2} justify="center" alignItems="center">
              <Label align="center">
                その他
                <br />
                修正値
              </Label>
            </Grid>
            {values.skills.map((skill, index) => (
              <Grid container item key={skill.id} spacing={1}>
                <Grid container item xs={1} justify="center" alignItems="center">
                  <BooleanValue name={`skills.${index}.classSkill`} input={input} {...props} align="center">{skill.classSkill}</BooleanValue>
                </Grid>
                <Grid container item xs={4} justify="center" alignItems="center">
                  <SkillNameValue name={`skills.${index}.name`} subName={`skills.${index}.subName`} skill={skill} input={input} {...props} align="left" />
                </Grid>
                <Grid container item xs={1} justify="center" alignItems="center">
                  <SkillAbilityValue name={`skills.${index}.ability`} skill={skill} input={input} {...props} align="center" />
                </Grid>
                <Grid container item xs={1} justify="center" alignItems="center">
                  <Grid item xs={9}>
                    <ComputeValue
                      name={`skills.${index}.skillModifier`}
                      input={input}
                      subscribe={`abilities.${getAbilityPosition(skill.ability)}.score,skills.${index}.ranks,skills.${index}.penalty,skills.${index}.miscModifier`}
                      compute={calcSkillModifier}
                      {...props}
                      align="center"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Label align="center">=</Label>
                  </Grid>
                </Grid>
                <Grid container item xs={1} justify="center" alignItems="center">
                  <Grid item xs={9}>
                    <ComputeValue
                      name={`skills.${index}.abilityModifier`}
                      input={input}
                      subscribe={`abilities.${getAbilityPosition(skill.ability)}.score`}
                      compute={calcModifier}
                      {...props}
                      align="center"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container item xs={1} justify="center" alignItems="center">
                  <Grid item xs={9}>
                    <Value name={`skills.${index}.ranks`} input={input} {...props} align="center" />
                  </Grid>
                  <Grid item xs={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container item xs={1} justify="center" alignItems="center">
                  <Grid item xs={9}>
                    <Value name={`skills.${index}.penalty`} input={input} {...props} align="center" />
                  </Grid>
                  <Grid item xs={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container item xs={2} justify="center" alignItems="center">
                  <Value name={`skills.${index}.miscModifier`} input={input} {...props} align="center" />
                </Grid>
              </Grid>
            ))}
          </Grid>
          <Label>
            <StopIcon style={{ fontSize: 12 }} />
            ...未修得でも使用できる技能
            <br />
            *...防具によるペナルティがあれば適用する技能(水泳技能には2倍のペナルティが適用される)
          </Label>
        </Grid>
      </Grid>
      <Grid container spacing={1}><Grid item><Box padding="12px" /></Grid></Grid>
      <Grid container item xs={12} spacing={1}>
        <Grid container item xs={3} justify="center">
          <Label2 align="center" className={classes.bgblack}>鎧・防御アイテム</Label2>
        </Grid>
        <Grid container item xs={1} justify="center">
          <Label align="center" className={classes.bgblack}>
            AC
            <br />
            ボーナス
          </Label>
        </Grid>
        <Grid container item xs={2} justify="center">
          <Label align="center" className={classes.bgblack}>タイプ</Label>
        </Grid>
        <Grid container item xs={1} justify="center">
          <Label align="center" className={classes.bgblack}>
            ACへの【敏】
            <br />
            ボーナス上限
          </Label>
        </Grid>
        <Grid container item xs={1} justify="center">
          <Label align="center" className={classes.bgblack}>判定ペナルティ</Label>
        </Grid>
        <Grid container item xs={1} justify="center">
          <Label align="center" className={classes.bgblack}>
            秘術呪文
            <br />
            失敗確率
          </Label>
        </Grid>
        <Grid container item xs={1} justify="center">
          <Label align="center" className={classes.bgblack}>重量</Label>
        </Grid>
        <Grid container item xs={2} justify="center">
          <Label align="center" className={classes.bgblack}>特性・その他</Label>
        </Grid>
        {values.protectiveItems.map((row, index) => (
          <Grid container item key={row.id} spacing={1}>
            <Grid container item xs={3} justify="center">
              <Value name={`protectiveItems.${index}.name`} input={input} {...props} align="center" />
            </Grid>
            <Grid container item xs={1} justify="center">
              <Value name={`protectiveItems.${index}.acBonus`} input={input} {...props} align="center" />
            </Grid>
            <Grid container item xs={2} justify="center">
              <Value name={`protectiveItems.${index}.type`} input={input} {...props} align="center" />
            </Grid>
            <Grid container item xs={1} justify="center">
              <Value name={`protectiveItems.${index}.dexMax`} input={input} {...props} align="center" />
            </Grid>
            <Grid container item xs={1} justify="center">
              <Value name={`protectiveItems.${index}.checkPenalty`} input={input} {...props} align="center" />
            </Grid>
            <Grid container item xs={1} justify="center">
              <Value name={`protectiveItems.${index}.spellFailure`} input={input} {...props} align="center" />
            </Grid>
            <Grid container item xs={1} justify="center">
              <Value name={`protectiveItems.${index}.weight`} input={input} {...props} align="center" />
            </Grid>
            <Grid container item xs={2} justify="center">
              <Value name={`protectiveItems.${index}.specialProperties`} input={input} {...props} align="center" />
            </Grid>
          </Grid>
        ))}
        <Grid container item xs={3} justify="center">
          <Label2 align="center" className={classes.bgblack}>合計</Label2>
        </Grid>
        <Grid container item xs={1} justify="center">
          <Value name="protectiveItemsTotal.acBonus" input={input} {...props} align="center" />
        </Grid>
        <Grid container item xs={2} justify="center" />
        <Grid container item xs={1} justify="center">
          <Value name="protectiveItemsTotal.dexMac" input={input} {...props} align="center" />
        </Grid>
        <Grid container item xs={1} justify="center">
          <Value name="protectiveItemsTotal.checkPenalty" input={input} {...props} align="center" />
        </Grid>
        <Grid container item xs={1} justify="center">
          <Value name="protectiveItemsTotal.spellFailure" input={input} {...props} align="center" />
        </Grid>
        <Grid container item xs={1} justify="center">
          <Value name="protectiveItemsTotal.weight" input={input} {...props} align="center" />
        </Grid>
        <Grid container item xs={2} justify="center">
          <Value name="protectiveItemsTotal.specialProperties" input={input} {...props} align="center" />
        </Grid>
      </Grid>
      <Grid container spacing={1}><Grid item><Box padding="12px" /></Grid></Grid>
      <Grid container item xs={12} spacing={1} alignItems="flex-start">
        <Grid container item xs={4} spacing={1}>
          <Grid container item xs={12} justify="center">
            <Label2 align="center" className={classes.bgblack}>装備品</Label2>
          </Grid>
          <Grid container item xs={input ? 7 : 9} justify="center">
            <Label align="center">アイテム</Label>
          </Grid>
          <Grid container item xs={3} justify="center">
            <Label align="center">重量</Label>
          </Grid>
          {input
            && (
              <Grid container item xs={2} justify="center">
                <Label align="center">操作</Label>
              </Grid>
            )}
          <FieldArray name="posessions">
            {({
              insert, remove, move, push,
            }) => (
              <>
                {values.posessions.length > 0 ? values.posessions.map((posession, index) => (
                  <Grid container item key={posession.id} spacing={1}>
                    <Grid container item xs={input ? 7 : 9} justify="center">
                      <Value name={`posessions.${index}.item`} input={input} {...props} />
                    </Grid>
                    <Grid container item xs={3} justify="center">
                      <Value name={`posessions.${index}.weight`} input={input} {...props} />
                    </Grid>
                    {input
                      && (
                        <Grid container item xs={2} justify="center">
                          <Grid container item xs={3} justify="center">
                            <button type="button" className="secondary" onClick={() => insert(index + 1, new Posession('', ''))}><AddIcon style={{ fontSize: 9 }} /></button>
                          </Grid>
                          <Grid container item xs={3} justify="center">
                            <button type="button" className="secondary" onClick={() => remove(index)}><RemoveIcon style={{ fontSize: 9 }} /></button>
                          </Grid>
                          <Grid container item xs={3} justify="center">
                            {index === 0 ? '' : <button type="button" className="secondary" onClick={() => move(index, index - 1)}><ArrowUpwardIcon style={{ fontSize: 9 }} /></button> }
                          </Grid>
                          <Grid container item xs={3} justify="center">
                            {index === values.posessions.length - 1 ? '' : <button type="button" className="secondary" onClick={() => move(index, index + 1)}><ArrowDownwardIcon style={{ fontSize: 9 }} /></button> }
                          </Grid>
                        </Grid>
                      )}
                  </Grid>
                )) : <Grid container item xs={12} justify="flex-end"><button type="button" className="secondary" onClick={() => push(new Posession('', ''))}><AddIcon style={{ fontSize: 9 }} /></button></Grid>}
              </>
            )}
          </FieldArray>
          <Grid container item xs={9} justify="center">
            <Label2 align="center" className={classes.bgblack}>運搬重量の合計</Label2>
          </Grid>
          <Grid container item xs={3} justify="center">
            <Value name="totalWeightCarried" input={input} {...props} />
          </Grid>
          <Grid item xs={12} />
          <Grid container item xs={12} justify="center">
            <Label2 align="center" className={classes.bgblack}>所持金</Label2>
          </Grid>
          <Grid container item xs={3} justify="center">
            <Value name="money.cp" input={input} {...props} />
          </Grid>
          <Grid container item xs={3} justify="center">
            <Value name="money.sp" input={input} {...props} />
          </Grid>
          <Grid container item xs={3} justify="center">
            <Value name="money.gp" input={input} {...props} />
          </Grid>
          <Grid container item xs={3} justify="center">
            <Value name="money.pp" input={input} {...props} />
          </Grid>
          <Grid container item xs={3} justify="center">
            <Label>銅貨(cp)</Label>
          </Grid>
          <Grid container item xs={3} justify="center">
            <Label>銀貨(sp)</Label>
          </Grid>
          <Grid container item xs={3} justify="center">
            <Label>金貨(gp)</Label>
          </Grid>
          <Grid container item xs={3} justify="center">
            <Label>白金貨(pp)</Label>
          </Grid>
          <Grid item xs={12} />
          <Grid container item xs={12} justify="center">
            <Label2 align="center" className={classes.bgblack}>荷重</Label2>
          </Grid>
          <Grid container item xs={2} justify="center">
            <Value name="load.lightLoad" input={input} {...props} />
          </Grid>
          <Grid container item xs={2} justify="center">
            <Value name="load.mediumLoad" input={input} {...props} />
          </Grid>
          <Grid container item xs={2} justify="center">
            <Value name="load.heavyLoad" input={input} {...props} />
          </Grid>
          <Grid container item xs={2} justify="center">
            <Value name="load.liftOverHead" input={input} {...props} />
          </Grid>
          <Grid container item xs={2} justify="center">
            <Value name="load.liftOffGround" input={input} {...props} />
          </Grid>
          <Grid container item xs={2} justify="center">
            <Value name="load.pushOrDrag" input={input} {...props} />
          </Grid>
          <Grid container item xs={2} justify="center">
            <Label align="center">軽荷重</Label>
          </Grid>
          <Grid container item xs={2} justify="center">
            <Label align="center">中荷重</Label>
          </Grid>
          <Grid container item xs={2} justify="center">
            <Label align="center">重荷重</Label>
          </Grid>
          <Grid container item xs={2} justify="center">
            <Label align="center">
              頭上に
              <br />
              持ち上げる
              <br />
              =最大荷重
            </Label>
          </Grid>
          <Grid container item xs={2} justify="center">
            <Label align="center">
              地面から
              <br />
              持ち上げる
              <br />
              =最大荷重x2
            </Label>
          </Grid>
          <Grid container item xs={2} justify="center">
            <Label align="center">
              押し引き
              <br />
              =最大荷重x3
            </Label>
          </Grid>
        </Grid>
        <Grid container item xs={4} spacing={1}>
          <Grid container item xs={12} justify="center">
            <Label2 align="center" className={classes.bgblack}>特技</Label2>
          </Grid>
          <Grid container item xs={12} justify="center">
            <MultiLineValue name="feat" input={input} {...props} />
          </Grid>
          <Grid container item xs={12} justify="center">
            <Label2 align="center" className={classes.bgblack}>特殊能力</Label2>
          </Grid>
          <Grid container item xs={12} justify="center">
            <MultiLineValue name="specialAbility" input={input} {...props} />
          </Grid>
          <Grid container item xs={12} justify="center">
            <Label2 align="center" className={classes.bgblack}>言語</Label2>
          </Grid>
          <Grid container item xs={12} justify="center">
            <MultiLineValue name="language" input={input} {...props} />
          </Grid>
          <Grid container item xs={12} justify="center">
            <Label2 align="center" className={classes.bgblack}>経験点</Label2>
          </Grid>
          <Grid container item xs={12} justify="center">
            <Value name="experiencePoint" input={input} {...props} />
          </Grid>
        </Grid>
        <Grid container item xs={4} spacing={1}>
          <Grid container item xs={12} justify="center">
            <Label2 align="center" className={classes.bgblack}>呪文</Label2>
          </Grid>
          <Grid container item xs={12} justify="center">
            <MultiLineValue name="spell" input={input} rows={50} {...props} />
          </Grid>
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={1} alignItems="flex-start">
        <Grid container item xs={12} justify="center">
          <Label2 align="center" className={classes.bgblack}>設定など</Label2>
        </Grid>
        <Grid container item xs={12} justify="center">
          <MultiLineValue name="setting" input={input} {...props} />
        </Grid>
      </Grid>
    </div>
  )
}

export default CharacterSheet
