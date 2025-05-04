"use client"

import AddIcon from "@mui/icons-material/Add"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import RemoveIcon from "@mui/icons-material/Remove"
import StopIcon from "@mui/icons-material/Stop"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Stack from "@mui/material/Stack"
import makeStyles from "@mui/styles/makeStyles"
import { useFieldArray } from "react-hook-form"

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
} from "@/src/components"
import { type Character, Posession } from "@/src/models"
import {
  calcArmorClass,
  calcGrappleModifier,
  calcInitiative,
  calcModifier,
  calcSavingThrow,
  calcSkillModifier,
  getAbilityPosition,
  getSTCorrespondingAbility,
} from "@/src/utils"

const useStyles = makeStyles({
  bgblack: {
    background: "black",
    color: "white",
  },
  bgslightgray: {
    background: "rgb(248,248,248)",
  },
  acGridWidth: {
    flexGrow: 0,
    maxWidth: "7.3%",
    flexBasis: "7.3%",
  },
})

type CharacterSheetProps = {
  input: boolean
  values: Character
}

const CharacterSheet = ({ input, values, ...props }: CharacterSheetProps) => {
  const classes = useStyles()

  const { append, remove, move, insert } = input
    ? useFieldArray({
        name: "posessions",
      })
    : {}

  return (
    <div className={input ? classes.bgslightgray : ""}>
      <Grid container spacing={1} size={12}>
        <Grid container size={3}>
          <ImageValue name="image" input={input} values={values} {...props} />
        </Grid>
        <Grid container spacing={0} size={9}>
          <Grid container size={12}>
            <Grid container spacing={0} size={12}>
              <Label>タグ</Label>
              <Value name="tags" input={input} values={values} {...props} />
            </Grid>
          </Grid>
          <Grid container spacing={1} size={12}>
            <Grid container spacing={0} size={3}>
              <Label>キャラクター名</Label>
              <Value name="pcName" input={input} values={values} {...props} />
            </Grid>
            <Grid container spacing={0} size={3}>
              <Label>属性</Label>
              <Value name="alignment" input={input} values={values} {...props} />
            </Grid>
            <Grid container spacing={0} size={3}>
              <Label>プレイヤー名</Label>
              <Value name="plName" input={input} values={values} {...props} />
            </Grid>
            <Grid container spacing={0} size={3}>
              <Label>最終更新</Label>
              <DateValue name="updateTime" input={input} values={values} {...props} />
            </Grid>
          </Grid>
          <Grid container spacing={1} size={12}>
            <Grid container spacing={0} size={9}>
              <Label>クラス/キャラクターレベル</Label>
              <Value name="classLevel" input={input} values={values} {...props} />
            </Grid>
            <Grid container spacing={0} size={3}>
              <Label>信仰する神</Label>
              <Value name="deity" input={input} values={values} {...props} />
            </Grid>
          </Grid>
          <Grid container spacing={1} size={12}>
            <Grid container spacing={0} size={2}>
              <Label>種族</Label>
              <Value name="race" input={input} values={values} {...props} />
            </Grid>
            <Grid container spacing={0} size={2}>
              <Label>サイズ</Label>
              <Value name="size" input={input} values={values} {...props} />
            </Grid>
            <Grid container spacing={0} size={2}>
              <Label>性別</Label>
              <Value name="gender" input={input} values={values} {...props} />
            </Grid>
            <Grid container spacing={0} size={2}>
              <Label>年齢</Label>
              <Value name="age" input={input} values={values} {...props} />
            </Grid>
            <Grid container spacing={0} size={2}>
              <Label>身長</Label>
              <Value name="height" input={input} values={values} {...props} />
            </Grid>
            <Grid container spacing={0} size={2}>
              <Label>体重</Label>
              <Value name="weight" input={input} values={values} {...props} />
            </Grid>
          </Grid>
          <Grid container spacing={1} size={12}>
            <Grid container spacing={0} size={4}>
              <Label>髪の色</Label>
              <Value name="hairColor" input={input} values={values} {...props} />
            </Grid>
            <Grid container spacing={0} size={4}>
              <Label>瞳の色</Label>
              <Value name="eyeColor" input={input} values={values} {...props} />
            </Grid>
            <Grid container spacing={0} size={4}>
              <Label>肌の色</Label>
              <Value name="skinColor" input={input} values={values} {...props} />
            </Grid>
          </Grid>
          <Grid container spacing={1} size={12}>
            <Grid container spacing={0} size={12}>
              <Label>メモ欄</Label>
              <Value name="memo" input={input} values={values} {...props} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={1} alignItems="flex-start" size={12}>
        <Grid container spacing={1} size={6}>
          <Grid container spacing={0} size={6} alignItems="stretch">
            <Grid container spacing={0} size={12}>
              <Grid container spacing={1} size={12}>
                <Grid container alignItems="flex-end" size={3}>
                  <Label>能力名</Label>
                </Grid>
                <Grid container alignItems="flex-end" size={3}>
                  <Label>能力値</Label>
                </Grid>
                <Grid container alignItems="flex-end" size={2}>
                  <Label>
                    能力
                    <br />
                    修正値
                  </Label>
                </Grid>
                <Grid container alignItems="flex-end" size={2}>
                  <Label>
                    一時的
                    <br />
                    能力値
                  </Label>
                </Grid>
                <Grid container alignItems="flex-end" size={2}>
                  <Label>
                    一時的
                    <br />
                    修正値
                  </Label>
                </Grid>
              </Grid>
              {values.abilities.map((row, index: number) => (
                <Grid container key={row.id} spacing={1} size={12}>
                  <Grid container alignItems="center" size={3}>
                    <Label2 className={classes.bgblack}>{row.name}</Label2>
                  </Grid>
                  <Grid container alignItems="center" size={3}>
                    <Value name={`abilities.${index}.score`} input={input} values={values} {...props} />
                  </Grid>
                  <Grid container alignItems="center" size={2}>
                    <ComputeValue
                      name={`abilities.${index}.modifier`}
                      input={input}
                      subscribe={`abilities.${index}.score`}
                      compute={calcModifier}
                      values={values}
                      {...props}
                    />
                  </Grid>
                  <Grid container alignItems="center" size={2}>
                    <Value name={`abilities.${index}.temporaryScore`} input={input} values={values} {...props} />
                  </Grid>
                  <Grid container alignItems="center" size={2}>
                    <Value name={`abilities.${index}.temporaryModifier`} input={input} values={values} {...props} />
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid container spacing={1} size={6}>
            <Grid size={12} />
            <Grid container spacing={1} size={12}>
              <Grid container alignItems="flex-end" size={4} />
              <Grid container alignItems="flex-end" size={4}>
                <Label>最大値</Label>
              </Grid>
              <Grid container alignItems="flex-end" size={4}>
                <Label>ダメージ減少</Label>
              </Grid>
            </Grid>
            <Grid container spacing={1} size={12}>
              <Grid container alignItems="center" size={4}>
                <Label2 align="center" className={classes.bgblack}>
                  HP
                </Label2>
              </Grid>
              <Grid container alignItems="center" size={4}>
                <Value name="hitPoint.total" input={input} values={values} {...props} />
              </Grid>
              <Grid container alignItems="center" size={4}>
                <Value name="hitPoint.damageReduction" input={input} values={values} {...props} />
              </Grid>
            </Grid>
            <Grid container size={12}>
              <Grid container spacing={0} size={12}>
                <Label>負傷/現在のHP</Label>
                <Value name="hitPoint.current" input={input} values={values} {...props} />
              </Grid>
            </Grid>
            <Grid container size={12}>
              <Grid container spacing={0} size={12}>
                <Label>非致傷ダメージ</Label>
                <Value name="hitPoint.nonlethalDamage" input={input} values={values} {...props} />
              </Grid>
            </Grid>
            <Grid container alignItems="center" justifyContent="center" size={3}>
              <Label2 align="center" className={classes.bgblack}>
                イニシアチブ
                <br />
                修正値
              </Label2>
            </Grid>
            <Grid container alignItems="center" spacing={0} size={9}>
              <Grid container alignItems="center" size={12}>
                <Grid container size={4}>
                  <Grid container size={9}>
                    <ComputeValue
                      name="initiative.total"
                      input={input}
                      subscribe="abilities.1.score,initiative.miscModifier"
                      compute={calcInitiative}
                      values={values}
                      {...props}
                    />
                  </Grid>
                  <Grid container justifyContent="center" size={3}>
                    <Label align="center">=</Label>
                  </Grid>
                </Grid>
                <Grid container size={4}>
                  <Grid container size={9}>
                    <ComputeValue
                      name="initiative.dexModifier"
                      input={input}
                      subscribe={`abilities.${getAbilityPosition("【敏】")}.score`}
                      compute={calcModifier}
                      values={values}
                      {...props}
                    />
                  </Grid>
                  <Grid container justifyContent="center" size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container size={4}>
                  <Value name="initiative.miscModifier" input={input} values={values} {...props} />
                </Grid>
              </Grid>
              <Grid container size={12}>
                <Grid container alignItems="flex-start" size={4}>
                  <Label>合計</Label>
                </Grid>
                <Grid container alignItems="flex-start" size={4}>
                  <Label>
                    【敏】
                    <br />
                    修正値
                  </Label>
                </Grid>
                <Grid container alignItems="flex-start" size={4}>
                  <Label>
                    その他の
                    <br />
                    修正値
                  </Label>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={1} size={12}>
            <Grid container alignItems="center" spacing={0} size={1}>
              <Label2 align="center" className={classes.bgblack}>
                AC
              </Label2>
            </Grid>
            <Grid container alignItems="center" spacing={0} size={11}>
              <Grid container spacing={0} size={12}>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <ComputeValue
                      name="ac.total"
                      input={input}
                      subscribe="ac.armorBonus,ac.shieldBonus,ac.dexModifier,ac.sizeModifier,ac.naturalArmor,ac.deflectionBonus,ac.luckBonus,ac.insightBonus,ac.moraleBonus,ac.miscModifier"
                      compute={calcArmorClass}
                      values={values}
                      {...props}
                    />
                  </Grid>
                  <Grid container justifyContent="center" size={3}>
                    <Label align="center">=</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container justifyContent="center" size={6}>
                    <Label align="center">10</Label>
                  </Grid>
                  <Grid container justifyContent="center" size={6}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <Value name="ac.armorBonus" input={input} values={values} {...props} />
                  </Grid>
                  <Grid container justifyContent="center" size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <Value name="ac.shieldBonus" input={input} values={values} {...props} />
                  </Grid>
                  <Grid container justifyContent="center" size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <Value name="ac.dexModifier" input={input} values={values} {...props} />
                  </Grid>
                  <Grid container justifyContent="center" size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <Value name="ac.sizeModifier" input={input} values={values} {...props} />
                  </Grid>
                  <Grid container justifyContent="center" size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <Value name="ac.naturalArmor" input={input} values={values} {...props} />
                  </Grid>
                  <Grid container justifyContent="center" size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <Value name="ac.deflectionBonus" input={input} values={values} {...props} />
                  </Grid>
                  <Grid container justifyContent="center" size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <Value name="ac.luckBonus" input={input} values={values} {...props} />
                  </Grid>
                  <Grid container justifyContent="center" size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <Value name="ac.insightBonus" input={input} values={values} {...props} />
                  </Grid>
                  <Grid container justifyContent="center" size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <Value name="ac.moraleBonus" input={input} values={values} {...props} />
                  </Grid>
                  <Grid container justifyContent="center" size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={12}>
                    <Value name="ac.miscModifier" input={input} values={values} {...props} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid container spacing={0} size={12}>
                <Grid container alignItems="flex-start" size={1}>
                  <Label align="center">合計</Label>
                </Grid>
                <Grid container alignItems="center" size={1} />
                <Grid container alignItems="flex-start" size={1}>
                  <Label>
                    鎧
                    <br />
                    ボーナス
                  </Label>
                </Grid>
                <Grid container alignItems="flex-start" size={1}>
                  <Label>
                    盾
                    <br />
                    ボーナス
                  </Label>
                </Grid>
                <Grid container alignItems="flex-start" size={1}>
                  <Label>
                    【敏】
                    <br />
                    修正値
                  </Label>
                </Grid>
                <Grid container alignItems="flex-start" size={1}>
                  <Label>
                    サイズ
                    <br />
                    修正値
                  </Label>
                </Grid>
                <Grid container alignItems="flex-start" size={1}>
                  <Label>
                    外皮
                    <br />
                    ボーナス
                  </Label>
                </Grid>
                <Grid container alignItems="flex-start" size={1}>
                  <Label>
                    反発
                    <br />
                    ボーナス
                  </Label>
                </Grid>
                <Grid container alignItems="flex-start" size={1}>
                  <Label>
                    幸運
                    <br />
                    ボーナス
                  </Label>
                </Grid>
                <Grid container alignItems="flex-start" size={1}>
                  <Label>
                    洞察
                    <br />
                    ボーナス
                  </Label>
                </Grid>
                <Grid container alignItems="flex-start" size={1}>
                  <Label>
                    士気
                    <br />
                    ボーナス
                  </Label>
                </Grid>
                <Grid container alignItems="flex-start" size={1}>
                  <Label>
                    その他の
                    <br />
                    修正値
                  </Label>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={1} size={12}>
            <Grid container justifyContent="center" alignItems="center" size={3}>
              <Label2 align="center" className={classes.bgblack}>
                接触
                <br />
                アーマークラス
              </Label2>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={3}>
              <Value name="ac.touchAc" input={input} values={values} {...props} />
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={3}>
              <Label2 align="center" className={classes.bgblack}>
                立ちすくみ
                <br />
                アーマークラス
              </Label2>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={3}>
              <Value name="ac.flatFootedAc" input={input} values={values} {...props} />
            </Grid>
          </Grid>
          <Grid container spacing={1} size={12}>
            <Grid container spacing={1} size={10}>
              <Grid container size={12}>
                <Grid container size={3}>
                  <Grid container alignItems="flex-end" size={12}>
                    <Label>
                      セーヴィング
                      <br />
                      ・スロー
                    </Label>
                  </Grid>
                </Grid>
                <Grid container spacing={1} size={9}>
                  <Grid container alignItems="flex-end" size={2}>
                    <Label>合計</Label>
                  </Grid>
                  <Grid container alignItems="flex-end" size={2}>
                    <Label>
                      基本
                      <br />
                      セーヴ
                    </Label>
                  </Grid>
                  <Grid container alignItems="flex-end" size={2}>
                    <Label>
                      能力
                      <br />
                      修正値
                    </Label>
                  </Grid>
                  <Grid container alignItems="flex-end" size={2}>
                    <Label>
                      魔法による
                      <br />
                      修正値
                    </Label>
                  </Grid>
                  <Grid container alignItems="flex-end" size={2}>
                    <Label>
                      その他
                      <br />
                      修正値
                    </Label>
                  </Grid>
                  <Grid container alignItems="flex-end" size={2}>
                    <Label>
                      一時的
                      <br />
                      修正値
                    </Label>
                  </Grid>
                </Grid>
              </Grid>
              {values.savingThrows.map((row, index) => (
                <Grid container key={row.id} spacing={1} size={12}>
                  <Grid container size={3}>
                    <Grid container justifyContent="center" alignItems="center" size={12}>
                      <Label2 align="center" className={classes.bgblack}>
                        {row.name}
                      </Label2>
                    </Grid>
                  </Grid>
                  <Grid container size={9}>
                    <Grid container justifyContent="center" alignItems="center" size={2}>
                      <Grid container size={8}>
                        <ComputeValue
                          name={`savingThrows.${index}.total`}
                          input={input}
                          subscribe={`savingThrows.${index}.baseSave,abilities.${getAbilityPosition(getSTCorrespondingAbility(row.name))}.score,savingThrows.${index}.magicModifier,savingThrows.${index}.miscModifier,savingThrows.${index}.temporaryModifier`}
                          compute={calcSavingThrow}
                          values={values}
                          {...props}
                        />
                      </Grid>
                      <Grid container size={4}>
                        <Label align="center">=</Label>
                      </Grid>
                    </Grid>
                    <Grid container justifyContent="center" alignItems="center" size={2}>
                      <Grid container size={8}>
                        <Value name={`savingThrows.${index}.baseSave`} input={input} values={values} {...props} />
                      </Grid>
                      <Grid container size={4}>
                        <Label align="center">+</Label>
                      </Grid>
                    </Grid>
                    <Grid container justifyContent="center" alignItems="center" size={2}>
                      <Grid container size={8}>
                        <ComputeValue
                          name={`savingThrows.${index}.abilityModifier`}
                          input={input}
                          subscribe={`abilities.${getAbilityPosition(getSTCorrespondingAbility(row.name))}.score`}
                          compute={calcModifier}
                          values={values}
                          {...props}
                        />
                      </Grid>
                      <Grid container size={4}>
                        <Label align="center">+</Label>
                      </Grid>
                    </Grid>
                    <Grid container justifyContent="center" alignItems="center" size={2}>
                      <Grid container size={9}>
                        <Value name={`savingThrows.${index}.magicModifier`} input={input} values={values} {...props} />
                      </Grid>
                      <Grid container size={3}>
                        <Label align="center">+</Label>
                      </Grid>
                    </Grid>
                    <Grid container justifyContent="center" alignItems="center" size={2}>
                      <Grid container size={9}>
                        <Value name={`savingThrows.${index}.miscModifier`} input={input} values={values} {...props} />
                      </Grid>
                      <Grid container size={3}>
                        <Label align="center">+</Label>
                      </Grid>
                    </Grid>
                    <Grid container justifyContent="center" alignItems="center" size={2}>
                      <Grid container size={12}>
                        <Value
                          name={`savingThrows.${index}.temporaryModifier`}
                          input={input}
                          values={values}
                          {...props}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
            <Grid spacing={1} size={2}>
              <Stack spacing={1} sx={{ height: "100%" }}>
                <Label>条件付きの修正値</Label>
                <MultiLineValue name="savingThrowConditionalModifier" input={input} values={values} {...props} />
              </Stack>
            </Grid>
          </Grid>
          <Grid container spacing={1} size={12}>
            <Grid container justifyContent="center" alignItems="center" size={3}>
              <Label2 align="center" className={classes.bgblack}>
                基本攻撃ボーナス
              </Label2>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={4}>
              <Value name="bab" input={input} values={values} {...props} align="center" />
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={2}>
              <Label2 align="center" className={classes.bgblack}>
                呪文抵抗
              </Label2>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={3}>
              <Value name="spellResistance" input={input} values={values} {...props} align="center" />
            </Grid>
          </Grid>
          <Grid container spacing={1} size={12}>
            <Grid container size={3}>
              <Grid container size={12} />
            </Grid>
            <Grid container size={9}>
              <Grid container justifyContent="center" alignItems="flex-end" size={2}>
                <Label align="center">合計</Label>
              </Grid>
              <Grid container justifyContent="center" alignItems="flex-end" size={2}>
                <Label align="center">
                  基本攻撃
                  <br />
                  ボーナス
                </Label>
              </Grid>
              <Grid container justifyContent="center" alignItems="flex-end" size={2}>
                <Label align="center">
                  【筋】
                  <br />
                  修正値
                </Label>
              </Grid>
              <Grid container justifyContent="center" alignItems="flex-end" size={2}>
                <Label align="center">
                  サイズ
                  <br />
                  修正値
                </Label>
              </Grid>
              <Grid container justifyContent="center" alignItems="flex-end" size={4}>
                <Label align="center">
                  その他
                  <br />
                  修正値
                </Label>
              </Grid>
            </Grid>
            <Grid container spacing={1} size={12}>
              <Grid container size={3}>
                <Grid container justifyContent="center" alignItems="center" size={12}>
                  <Label2 align="center" className={classes.bgblack}>
                    組みつき修正値
                  </Label2>
                </Grid>
              </Grid>
              <Grid container size={9}>
                <Grid container justifyContent="center" alignItems="center" size={2}>
                  <Grid container size={8}>
                    <ComputeValue
                      name="grappleModifier.total"
                      input={input}
                      subscribe={`grappleModifier.bab,abilities.${getAbilityPosition("【筋】")}.score,grappleModifier.sizeModifier,grappleModifier.miscModifier`}
                      compute={calcGrappleModifier}
                      values={values}
                      {...props}
                      align="center"
                    />
                  </Grid>
                  <Grid container size={4}>
                    <Label align="center">=</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={2}>
                  <Grid container size={8}>
                    <Value name="grappleModifier.bab" input={input} values={values} {...props} align="center" />
                  </Grid>
                  <Grid container size={4}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={2}>
                  <Grid container size={8}>
                    <ComputeValue
                      name="grappleModifier.strengthModifier"
                      input={input}
                      subscribe={`abilities.${getAbilityPosition("【筋】")}.score`}
                      compute={calcModifier}
                      values={values}
                      {...props}
                      align="center"
                    />
                  </Grid>
                  <Grid container size={4}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={2}>
                  <Grid container size={9}>
                    <Value
                      name="grappleModifier.sizeModifier"
                      input={input}
                      values={values}
                      {...props}
                      align="center"
                    />
                  </Grid>
                  <Grid container size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={4}>
                  <Grid container size={12}>
                    <Value
                      name="grappleModifier.miscModifier"
                      input={input}
                      values={values}
                      {...props}
                      align="center"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={1} size={12}>
            {values.attacks.map((row, index) => (
              <Grid container key={row.id} spacing={1} size={12}>
                <Grid container justifyContent="center" alignItems="center" size={6}>
                  <Label2 align="center" className={classes.bgblack}>
                    攻撃
                    {index + 1}
                  </Label2>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={3}>
                  <Label align="center" className={classes.bgblack}>
                    攻撃ボーナス
                  </Label>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={2}>
                  <Label align="center" className={classes.bgblack}>
                    クリティカル
                  </Label>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Label align="center" className={classes.bgblack}>
                    重量
                  </Label>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={6}>
                  <Value name={`attacks.${index}.attack`} input={input} values={values} {...props} align="center" />
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={3}>
                  <Value
                    name={`attacks.${index}.attackBonus`}
                    input={input}
                    values={values}
                    {...props}
                    align="center"
                  />
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={2}>
                  <Value name={`attacks.${index}.critical`} input={input} values={values} {...props} align="center" />
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Value name={`attacks.${index}.weight`} input={input} values={values} {...props} align="center" />
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={2}>
                  <Label align="center" className={classes.bgblack}>
                    タイプ
                  </Label>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Label align="center" className={classes.bgblack}>
                    射程
                  </Label>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={3}>
                  <Label align="center" className={classes.bgblack}>
                    その他・矢弾等
                  </Label>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={6}>
                  <Label align="center" className={classes.bgblack}>
                    ダメージ
                  </Label>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={2}>
                  <Value name={`attacks.${index}.type`} input={input} values={values} {...props} align="center" />
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Value name={`attacks.${index}.range`} input={input} values={values} {...props} align="center" />
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={3}>
                  <Value name={`attacks.${index}.notes`} input={input} values={values} {...props} align="center" />
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={6}>
                  <Value name={`attacks.${index}.damage`} input={input} values={values} {...props} align="center" />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid container spacing={1} size={6}>
          <Grid container spacing={1} size={12}>
            <Grid container justifyContent="center" alignItems="center" size={4}>
              <Label2 className={classes.bgblack}>移動速度</Label2>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={8}>
              <Value name="speed" input={input} values={values} {...props} />
            </Grid>
          </Grid>
          <Grid container spacing={1} size={12}>
            <Grid container justifyContent="center" alignItems="center" size={12}>
              <Label2 className={classes.bgblack}>技能</Label2>
            </Grid>
          </Grid>
          <Grid container spacing={1} size={12}>
            <Grid container justifyContent="center" alignItems="center" size={1}>
              <Label>
                クラス
                <br />
                技能
              </Label>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={4}>
              <Label>技能名</Label>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={1}>
              <Label>
                対応
                <br />
                能力値
              </Label>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={1}>
              <Label>
                技能
                <br />
                修正値
              </Label>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={1}>
              <Label>
                能力
                <br />
                修正値
              </Label>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={1}>
              <Label>ランク</Label>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={1}>
              <Label>
                防具
                <br />
                による
                <br />
                ペナルティ
              </Label>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" size={2}>
              <Label>
                その他
                <br />
                修正値
              </Label>
            </Grid>
          </Grid>
          <Grid container spacing={0} size={12}>
            {values.skills.map((skill, index) => (
              <Grid container key={skill.id} spacing={1} size={12}>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <BooleanValue name={`skills.${index}.classSkill`} input={input} values={values} {...props} />
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={4}>
                  <SkillNameValue
                    name={`skills.${index}.name`}
                    subName={`skills.${index}.subName`}
                    skill={skill}
                    input={input}
                    values={values}
                    {...props}
                    align="left"
                  />
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <SkillAbilityValue
                    name={`skills.${index}.ability`}
                    skill={skill}
                    input={input}
                    values={values}
                    {...props}
                  />
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <ComputeValue
                      name={`skills.${index}.skillModifier`}
                      input={input}
                      subscribe={`abilities.${getAbilityPosition(skill.ability)}.score,skills.${index}.ranks,skills.${index}.penalty,skills.${index}.miscModifier`}
                      compute={calcSkillModifier}
                      values={values}
                      {...props}
                    />
                  </Grid>
                  <Grid container size={3}>
                    <Label align="center">=</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <ComputeValue
                      name={`skills.${index}.abilityModifier`}
                      input={input}
                      subscribe={`abilities.${getAbilityPosition(skill.ability)}.score`}
                      compute={calcModifier}
                      values={values}
                      {...props}
                    />
                  </Grid>
                  <Grid container size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <Value name={`skills.${index}.ranks`} input={input} values={values} {...props} />
                  </Grid>
                  <Grid container size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={1}>
                  <Grid container size={9}>
                    <Value name={`skills.${index}.penalty`} input={input} values={values} {...props} />
                  </Grid>
                  <Grid container size={3}>
                    <Label align="center">+</Label>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" size={2}>
                  <Value name={`skills.${index}.miscModifier`} input={input} values={values} {...props} />
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
      <Grid container spacing={1}>
        <Grid>
          <Box padding="12px" />
        </Grid>
      </Grid>
      <Grid container spacing={1} size={12}>
        <Grid container justifyContent="center" size={3}>
          <Label2 align="center" className={classes.bgblack}>
            鎧・防御アイテム
          </Label2>
        </Grid>
        <Grid container justifyContent="center" size={1}>
          <Label align="center" className={classes.bgblack}>
            AC
            <br />
            ボーナス
          </Label>
        </Grid>
        <Grid container justifyContent="center" size={2}>
          <Label align="center" className={classes.bgblack}>
            タイプ
          </Label>
        </Grid>
        <Grid container justifyContent="center" size={1}>
          <Label align="center" className={classes.bgblack}>
            ACへの【敏】
            <br />
            ボーナス上限
          </Label>
        </Grid>
        <Grid container justifyContent="center" size={1}>
          <Label align="center" className={classes.bgblack}>
            判定ペナルティ
          </Label>
        </Grid>
        <Grid container justifyContent="center" size={1}>
          <Label align="center" className={classes.bgblack}>
            秘術呪文
            <br />
            失敗確率
          </Label>
        </Grid>
        <Grid container justifyContent="center" size={1}>
          <Label align="center" className={classes.bgblack}>
            重量
          </Label>
        </Grid>
        <Grid container justifyContent="center" size={2}>
          <Label align="center" className={classes.bgblack}>
            特性・その他
          </Label>
        </Grid>
        {values.protectiveItems.map((row, index) => (
          <Grid container key={row.id} spacing={1} size={12}>
            <Grid container justifyContent="center" size={3}>
              <Value name={`protectiveItems.${index}.name`} input={input} values={values} {...props} align="center" />
            </Grid>
            <Grid container justifyContent="center" size={1}>
              <Value
                name={`protectiveItems.${index}.acBonus`}
                input={input}
                values={values}
                {...props}
                align="center"
              />
            </Grid>
            <Grid container justifyContent="center" size={2}>
              <Value name={`protectiveItems.${index}.type`} input={input} values={values} {...props} align="center" />
            </Grid>
            <Grid container justifyContent="center" size={1}>
              <Value name={`protectiveItems.${index}.dexMax`} input={input} values={values} {...props} align="center" />
            </Grid>
            <Grid container justifyContent="center" size={1}>
              <Value
                name={`protectiveItems.${index}.checkPenalty`}
                input={input}
                values={values}
                {...props}
                align="center"
              />
            </Grid>
            <Grid container justifyContent="center" size={1}>
              <Value
                name={`protectiveItems.${index}.spellFailure`}
                input={input}
                values={values}
                {...props}
                align="center"
              />
            </Grid>
            <Grid container justifyContent="center" size={1}>
              <Value name={`protectiveItems.${index}.weight`} input={input} values={values} {...props} align="center" />
            </Grid>
            <Grid container justifyContent="center" size={2}>
              <Value
                name={`protectiveItems.${index}.specialProperties`}
                input={input}
                values={values}
                {...props}
                align="center"
              />
            </Grid>
          </Grid>
        ))}
        <Grid container justifyContent="center" size={3}>
          <Label2 align="center" className={classes.bgblack}>
            合計
          </Label2>
        </Grid>
        <Grid container justifyContent="center" size={1}>
          <Value name="protectiveItemsTotal.acBonus" input={input} values={values} {...props} align="center" />
        </Grid>
        <Grid container justifyContent="center" size={2} />
        <Grid container justifyContent="center" size={1}>
          <Value name="protectiveItemsTotal.dexMac" input={input} values={values} {...props} align="center" />
        </Grid>
        <Grid container justifyContent="center" size={1}>
          <Value name="protectiveItemsTotal.checkPenalty" input={input} values={values} {...props} align="center" />
        </Grid>
        <Grid container justifyContent="center" size={1}>
          <Value name="protectiveItemsTotal.spellFailure" input={input} values={values} {...props} align="center" />
        </Grid>
        <Grid container justifyContent="center" size={1}>
          <Value name="protectiveItemsTotal.weight" input={input} values={values} {...props} align="center" />
        </Grid>
        <Grid container justifyContent="center" size={2}>
          <Value
            name="protectiveItemsTotal.specialProperties"
            input={input}
            values={values}
            {...props}
            align="center"
          />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid>
          <Box padding="12px" />
        </Grid>
      </Grid>
      <Grid container spacing={1} alignItems="flex-start" size={12}>
        <Grid container spacing={1} size={4}>
          <Grid container justifyContent="center" size={12}>
            <Label2 align="center" className={classes.bgblack}>
              装備品
            </Label2>
          </Grid>
          <Grid container justifyContent="center" size={input ? 6 : 9}>
            <Label align="center">アイテム</Label>
          </Grid>
          <Grid container justifyContent="center" size={3}>
            <Label align="center">重量</Label>
          </Grid>
          {input && (
            <Grid container justifyContent="center" size={3}>
              <Label align="center">操作</Label>
            </Grid>
          )}
          {values.posessions.length > 0 ? (
            values.posessions.map((posession, index) => (
              <Grid container key={posession.id} spacing={1} size={12}>
                <Grid container justifyContent="center" size={input ? 6 : 9}>
                  <Value name={`posessions.${index}.item`} input={input} values={values} {...props} />
                </Grid>
                <Grid container justifyContent="center" size={3}>
                  <Value name={`posessions.${index}.weight`} input={input} values={values} {...props} />
                </Grid>
                {input && (
                  <Grid container justifyContent="center" size={3}>
                    <Grid container justifyContent="center" size={3}>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => (insert ? insert(index + 1, new Posession("", "")) : null)}
                      >
                        <AddIcon style={{ fontSize: 9 }} />
                      </button>
                    </Grid>
                    <Grid container justifyContent="center" size={3}>
                      <button type="button" className="secondary" onClick={() => (remove ? remove(index) : null)}>
                        <RemoveIcon style={{ fontSize: 9 }} />
                      </button>
                    </Grid>
                    <Grid container justifyContent="center" size={3}>
                      {index === 0 ? (
                        ""
                      ) : (
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => (move ? move(index, index - 1) : null)}
                        >
                          <ArrowUpwardIcon style={{ fontSize: 9 }} />
                        </button>
                      )}
                    </Grid>
                    <Grid container justifyContent="center" size={3}>
                      {index === values.posessions.length - 1 ? (
                        ""
                      ) : (
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => (move ? move(index, index + 1) : null)}
                        >
                          <ArrowDownwardIcon style={{ fontSize: 9 }} />
                        </button>
                      )}
                    </Grid>
                  </Grid>
                )}
              </Grid>
            ))
          ) : (
            <Grid container justifyContent="flex-end" size={12}>
              <button
                type="button"
                className="secondary"
                onClick={() => (append ? append(new Posession("", "")) : null)}
              >
                <AddIcon style={{ fontSize: 9 }} />
              </button>
            </Grid>
          )}
          <Grid container justifyContent="center" size={9}>
            <Label2 align="center" className={classes.bgblack}>
              運搬重量の合計
            </Label2>
          </Grid>
          <Grid container justifyContent="center" size={3}>
            <Value name="totalWeightCarried" input={input} values={values} {...props} />
          </Grid>
          <Grid size={12} />
          <Grid container justifyContent="center" size={12}>
            <Label2 align="center" className={classes.bgblack}>
              所持金
            </Label2>
          </Grid>
          <Grid container justifyContent="center" size={3}>
            <Value name="money.cp" input={input} values={values} {...props} />
          </Grid>
          <Grid container justifyContent="center" size={3}>
            <Value name="money.sp" input={input} values={values} {...props} />
          </Grid>
          <Grid container justifyContent="center" size={3}>
            <Value name="money.gp" input={input} values={values} {...props} />
          </Grid>
          <Grid container justifyContent="center" size={3}>
            <Value name="money.pp" input={input} values={values} {...props} />
          </Grid>
          <Grid container justifyContent="center" size={3}>
            <Label>銅貨(cp)</Label>
          </Grid>
          <Grid container justifyContent="center" size={3}>
            <Label>銀貨(sp)</Label>
          </Grid>
          <Grid container justifyContent="center" size={3}>
            <Label>金貨(gp)</Label>
          </Grid>
          <Grid container justifyContent="center" size={3}>
            <Label>白金貨(pp)</Label>
          </Grid>
          <Grid size={12} />
          <Grid container justifyContent="center" size={12}>
            <Label2 align="center" className={classes.bgblack}>
              荷重
            </Label2>
          </Grid>
          <Grid container justifyContent="center" size={2}>
            <Value name="load.lightLoad" input={input} values={values} {...props} />
          </Grid>
          <Grid container justifyContent="center" size={2}>
            <Value name="load.mediumLoad" input={input} values={values} {...props} />
          </Grid>
          <Grid container justifyContent="center" size={2}>
            <Value name="load.heavyLoad" input={input} values={values} {...props} />
          </Grid>
          <Grid container justifyContent="center" size={2}>
            <Value name="load.liftOverHead" input={input} values={values} {...props} />
          </Grid>
          <Grid container justifyContent="center" size={2}>
            <Value name="load.liftOffGround" input={input} values={values} {...props} />
          </Grid>
          <Grid container justifyContent="center" size={2}>
            <Value name="load.pushOrDrag" input={input} values={values} {...props} />
          </Grid>
          <Grid container justifyContent="center" size={2}>
            <Label align="center">軽荷重</Label>
          </Grid>
          <Grid container justifyContent="center" size={2}>
            <Label align="center">中荷重</Label>
          </Grid>
          <Grid container justifyContent="center" size={2}>
            <Label align="center">重荷重</Label>
          </Grid>
          <Grid container justifyContent="center" size={2}>
            <Label align="center">
              頭上に
              <br />
              持ち上げる
              <br />
              =最大荷重
            </Label>
          </Grid>
          <Grid container justifyContent="center" size={2}>
            <Label align="center">
              地面から
              <br />
              持ち上げる
              <br />
              =最大荷重x2
            </Label>
          </Grid>
          <Grid container justifyContent="center" size={2}>
            <Label align="center">
              押し引き
              <br />
              =最大荷重x3
            </Label>
          </Grid>
        </Grid>
        <Grid container spacing={1} size={4}>
          <Grid container justifyContent="center" size={12}>
            <Label2 align="center" className={classes.bgblack}>
              特技
            </Label2>
          </Grid>
          <Grid container justifyContent="center" size={12}>
            <MultiLineValue name="feat" input={input} values={values} {...props} />
          </Grid>
          <Grid container justifyContent="center" size={12}>
            <Label2 align="center" className={classes.bgblack}>
              特殊能力
            </Label2>
          </Grid>
          <Grid container justifyContent="center" size={12}>
            <MultiLineValue name="specialAbility" input={input} values={values} {...props} />
          </Grid>
          <Grid container justifyContent="center" size={12}>
            <Label2 align="center" className={classes.bgblack}>
              言語
            </Label2>
          </Grid>
          <Grid container justifyContent="center" size={12}>
            <MultiLineValue name="language" input={input} values={values} {...props} />
          </Grid>
          <Grid container justifyContent="center" size={12}>
            <Label2 align="center" className={classes.bgblack}>
              経験点
            </Label2>
          </Grid>
          <Grid container justifyContent="center" size={12}>
            <Value name="experiencePoint" input={input} values={values} {...props} />
          </Grid>
        </Grid>
        <Grid container spacing={1} size={4}>
          <Grid container justifyContent="center" size={12}>
            <Label2 align="center" className={classes.bgblack}>
              呪文
            </Label2>
          </Grid>
          <Grid container justifyContent="center" size={12}>
            <MultiLineValue name="spell" input={input} values={values} rows={50} {...props} />
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={1} alignItems="flex-start" size={12}>
        <Grid container justifyContent="center" size={12}>
          <Label2 align="center" className={classes.bgblack}>
            設定など
          </Label2>
        </Grid>
        <Grid container justifyContent="center" size={12}>
          <MultiLineValue name="setting" input={input} values={values} {...props} />
        </Grid>
      </Grid>
    </div>
  )
}

export default CharacterSheet
