import {
  Grid,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core'
import {
  createMuiTheme,
  ThemeProvider,
  makeStyles,
} from '@material-ui/core/styles'
import {
  Check,
  Stop,
} from '@material-ui/icons'
import firebase from 'firebase/app'
import {
  Formik,
  Field,
  FastField,
  Form,
  useField,
  useFormikContext,
  getIn,
} from 'formik'
import {
  TextField,
  Checkbox,
} from 'formik-material-ui'

import jsSHA from 'jssha'

import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Prompt,
  useParams,
} from 'react-router-dom'
import * as Yup from 'yup'
import 'firebase/analytics'
import 'firebase/firestore'

const calcModifier = (xs) => Math.floor((Number(xs[0]) - 10) / 2)
const calcArmorClass = (xs) => xs.reduce((acc, cur) => Number(acc) + Number(cur), 10)
const calcInitiative = ([dex, misc]) => calcModifier([dex]) + Number(misc)
const calcSavingThrow = ([base, dex, magic, misc, temp]) => Number(base) + calcModifier([dex]) + Number(magic) + Number(misc) + Number(temp)
const calcGrappleModifier = ([bab, str, size, misc]) => Number(bab) + calcModifier([str]) + Number(size) + Number(misc)
const calcSkillModifier = ([ability, rank, penalty, misc]) => calcModifier([ability]) + Number(rank) + Number(penalty) + Number(misc)

const PromptIfDirty = () => {
  const formik = useFormikContext()
  return (
    <Prompt
      when={formik.dirty && formik.submitCount === 0}
      message="本当にこのページを離れますか? 未保存の変更があります。"
    />
  )
}

const Label = React.memo((props) => (
  <Box width="100%" padding="2px" fontSize="caption.fontSize" {...props}>
    {props.children}
  </Box>
), (prev, next) => prev.children === next.children)

const Label2 = React.memo((props) => (
  <Box width="100%" padding="2px" fontSize="caption2.fontSize" {...props}>
    {props.children}
  </Box>
), (prev, next) => prev.children === next.children)

const Value = React.memo(({ input, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta

  return (
    input
      ? <FastField component={TextField} size="small" fullWidth margin="none" variant="outlined" {...props} />
      : (
        <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
          {value}
        </Box>
      )
  )
})

const ComputeValue = React.memo(({ input, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta
  const {
    values, touched, setFieldValue, setTouched,
  } = useFormikContext()

  const subscribes = props.subscribe.split(',')
  const publishers = subscribes.map((x) => getIn(values, x)).filter((x) => (typeof x !== 'undefined'))
  const touchedPublishers = subscribes.map((x) => getIn(touched, x)).filter((x) => (typeof x !== 'undefined'))

  useEffect(() => {
    if (touchedPublishers.length) {
      setFieldValue(props.name, props.compute(publishers), false)
      setTouched({}, false)
    }
  }, [publishers, touchedPublishers, setFieldValue, props.name])

  return (
    input
      ? <FastField component={TextField} size="small" fullWidth margin="none" variant="outlined" disabled {...props} compute="" />
      : (
        <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props} compute="">
          {value}
        </Box>
      )
  )
})

const ImageValue = React.memo(({ input, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta

  return (
    input
      ? (
        <>
          <Label>画像URL</Label>
          <br />
          <Value input {...props} />
        </>
      )
      : (
        <Box width="100%" border={1} style={{ maxHeight: '250px' }}>
          <img
            src={value}
            style={{
              maxWidth: '100%', maxHeight: '100%', display: 'block', margin: 'auto',
            }}
          />
        </Box>
      )
  )
})

const MultiLineValue = React.memo(({ input, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta

  return (
    input
      ? <FastField component={TextField} multiline fullWidth rows={10} size="small" style={{ width: '100%' }} {...props} />
      : (
        <Box width="100%" minHeight="200px" fontSize="caption2.fontSize" border={1} {...props}>
          {value.split(/\r\n|\r|\n/).map((item, key) => (
            <React.Fragment key={key}>
              {item}
              <br />
            </React.Fragment>
          ))}
        </Box>
      )
  )
})

const BooleanValue = React.memo(({ input, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta

  return (
    input
      ? <FastField component={Checkbox} size="small" color="primary" checked={value} type="checkbox" indeterminate={false} {...props} />
      : (
        <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
          {value ? <Check style={{ fontSize: 12 }} /> : ''}
        </Box>
      )
  )
})

const DateValue = React.memo(({ input, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta
  const displayValue = new Date(value).toLocaleString()
  return (
    <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
      {displayValue}
    </Box>
  )
})

const SkillNameValue = React.memo(({
  input, name, subName, skill, ...props
}) => {
  const [, meta] = useField(name)
  const { value } = meta

  if (input && skill.hasSubName) {
    return (
      <>
        <Grid item xs={3}>
          <Box minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
            {value}
            {skill.usableUntrained ? <Stop style={{ fontSize: 12 }} /> : ''}
          </Box>
        </Grid>
        <Grid item xs={9}>
          <FastField name={subName} component={TextField} size="small" fullWidth margin="none" variant="outlined" {...props} />
        </Grid>
      </>
    )
  } if (input && skill.fullEditable) {
    return <FastField name={name} component={TextField} size="small" fullWidth margin="none" variant="outlined" {...props} />
  }

  return (
    <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
      {value}
      {skill.usableUntrained ? <Stop style={{ fontSize: 12 }} /> : ''}
      {skill.hasSubName ? skill.subName : ''}
    </Box>
  )
})

const SkillAbilityValue = React.memo(({ input, skill, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta

  return (
    (input && skill.fullEditable)
      ? <FastField component={TextField} size="small" fullWidth margin="none" variant="outlined" {...props} />
      : (
        <Box width="100%" minHeight="20px" fontSize="caption.fontSize" border={1} {...props}>
          {value}
          {skill.hasArmorPenalty ? '*' : ''}
        </Box>
      )
  )
})

const theme = createMuiTheme({
  typography: {
    caption: {
      fontSize: '0.5rem',
    },
    caption2: {
      fontSize: '0.75rem',
    },
  },
  overrides: {
    MuiOutlinedInput: {
      input: {
        padding: '1px',
      },
      inputMarginDense: {
        padding: '1px',
        paddingTop: '1px',
        paddingBottom: '1px',
      },
    },
    MuiInputBase: {
      root: {
        backgroundColor: 'white',
      },
    },
  },
})

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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error,
      errorInfo,
    })
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      )
    }
    // Normally, just render children
    return this.props.children
  }
}

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
    this.hp = new HitPoint('', '', '', '')
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
    this.attacks = new Array(6).fill(new Attack('', '', '', '', '', '', '', ''))
    this.speed = ''
    this.skills = INITIAL_SKILLS
    this.protectiveItems = new Array(10).fill(new ProtectiveItem('', '', '', '', '', '', '', ''))
    this.protectiveItemsTotal = new ProtectiveItemsTotal('', '', '', '', '', '')
    this.posessions = new Array(30).fill(new Posession('', ''))
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

class Ability {
  constructor(name) {
    this.name = name
    this.score = 10
    this.modifier = 0
    this.temporaryScore = 0
    this.temporaryModifier = 0
  }
}

class HitPoint {
  constructor(total, damageReduction, current, nonlethalDamage) {
    this.total = total
    this.damageReduction = damageReduction
    this.current = current
    this.nonlethalDamage = nonlethalDamage
  }
}

class Initiative {
  constructor(total, dexModifier, miscModifier) {
    this.total = total
    this.dexModifier = dexModifier
    this.miscModifier = miscModifier
  }
}

class ArmorClass {
  constructor(total, armorBonus, shieldBonus, dexModifier, sizeModifier, naturalArmor, deflectionBonus, luckBonus, insightBonus, moraleBonus, miscModifier, touchAc, flatFootedAc) {
    this.total = total
    this.armorBonus = armorBonus
    this.shieldBonus = shieldBonus
    this.dexModifier = dexModifier
    this.sizeModifier = sizeModifier
    this.naturalArmor = naturalArmor
    this.deflectionBonus = deflectionBonus
    this.luckBonus = luckBonus
    this.insightBonus = insightBonus
    this.moraleBonus = moraleBonus
    this.miscModifier = miscModifier
    this.touchAc = touchAc
    this.flatFootedAc = flatFootedAc
  }
}

class SavingThrow {
  constructor(name, total, baseSave, abilityModifier, magicModifier, miscModifier, temporaryModifier) {
    this.name = name
    this.total = total
    this.baseSave = baseSave
    this.abilityModifier = abilityModifier
    this.magicModifier = magicModifier
    this.miscModifier = miscModifier
    this.temporaryModifier = temporaryModifier
  }
}

class GrappleModifier {
  constructor(total, bab, strengthModifier, sizeModifier, miscModifier) {
    this.total = total
    this.bab = bab
    this.strengthModifier = strengthModifier
    this.sizeModifier = sizeModifier
    this.miscModifier = miscModifier
  }
}

class Attack {
  constructor(attack, attackBonus, critical, weight, type, range, notes, damage) {
    this.attack = attack
    this.attackBonus = attackBonus
    this.critical = critical
    this.weight = weight
    this.type = type
    this.range = range
    this.notes = notes
    this.damage = damage
  }
}

class Skill {
  constructor(name, ability, usableUntrained = true, hasArmorPenalty = false, hasSubName = false, fullEditable = false) {
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

class ProtectiveItem {
  constructor(name, acBonus, type, dexMax, checkPenalty, spellFailure, weight, specialProperties) {
    this.name = name
    this.acBonus = acBonus
    this.type = type
    this.dexMax = dexMax
    this.checkPenalty = checkPenalty
    this.spellFailure = spellFailure
    this.weight = weight
    this.specialProperties = specialProperties
  }
}

class ProtectiveItemsTotal {
  constructor(acBonus, dexMax, checkPenalty, spellFailure, weight, specialProperties) {
    this.acBonus = acBonus
    this.dexMax = dexMax
    this.checkPenalty = checkPenalty
    this.spellFailure = spellFailure
    this.weight = weight
    this.specialProperties = specialProperties
  }
}

class Posession {
  constructor(item, weight) {
    this.item = item
    this.weight = weight
  }
}

class Money {
  constructor(cp, sp, gp, pp) {
    this.cp = cp
    this.sp = sp
    this.gp = gp
    this.pp = pp
  }
}

class Load {
  constructor(lightLoad, mediumLoad, heavyLoad, liftOverHead, liftOffGround, pushOrDrag) {
    this.lightLoad = lightLoad
    this.mediumLoad = mediumLoad
    this.heavyLoad = heavyLoad
    this.liftOverHead = liftOverHead
    this.liftOffGround = liftOffGround
    this.pushOrDrag = pushOrDrag
  }
}

const ABILITY_POSITION = {
  '【筋】': 0,
  '【敏】': 1,
  '【耐】': 2,
  '【知】': 3,
  '【判】': 4,
  '【魅】': 5,
}

const getAbilityPosition = (ability) => ABILITY_POSITION[ability]

const ST_CORRESPONTING_ABILITY = {
  '頑健【耐久力】': '【耐】',
  '反応【敏捷力】': '【敏】',
  '意志【判断力】': '【判】',
}

const getSTCorrespondingAbility = (name) => ST_CORRESPONTING_ABILITY[name]

const INITIAL_SKILLS = [
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

function NewCharForm() {
  document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=1024')
  const schema = Yup.object().shape({
    passwordConfirm: Yup.mixed().oneOf([Yup.ref('password')], 'パスワードが一致しません。'),
  })
  return (
    <Formik
      initialValues={new Character()}
      onSubmit={async (values) => {
        const newDocRef = db.collection('characters').doc()
        values.updateTime = new Date()
        values.id = newDocRef.id

        const shaObj = new jsSHA('SHA-256', 'TEXT')
        shaObj.update(values.password)
        values.password = shaObj.getHash('HEX')
        values.passwordConfirm = ''

        newDocRef.set(JSON.parse(JSON.stringify(values)))
          .then(() => {
            console.log('Document successfully written!')
            document.location.href = '/'
          })
          .catch((error) => {
            console.error('Error writing document: ', error)
          })
      }}
      validationSchema={schema}
    >
      {({ values, errors, ...props }) => (
        <Form>
          <PromptIfDirty />
          <CharacterSheet input values={values} />
          <Label>パスワード</Label>
          <Field name="password" type="password" component={TextField} size="small" margin="none" variant="outlined" />
          <Label>パスワード(確認用)</Label>
          <Field name="passwordConfirm" type="password" component={TextField} size="small" margin="none" variant="outlined" />
          <br />
          <br />
          <Button onClick={props.handleSubmit} variant="contained" color="primary">保存</Button>
        </Form>
      )}
    </Formik>
  )
}

function ViewCharForm() {
  document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=1024')
  const { id } = useParams()
  const [character, setCharacter] = useState(new Character())

  useEffect(() => {
    const docRef = db.collection('characters').doc(id)
    docRef.get().then((doc) => {
      if (doc.exists) {
        const character = Object.assign(new Character(), doc.data())
        setCharacter(character)
      } else {
        console.log('No such document!')
      }
    }).catch((error) => {
      console.log('Error getting document:', error)
    })
  }, [id])

  return (
    <Formik
      initialValues={character}
      enableReinitialize
    >
      {({ values }) => {
        if (!values.id) {
          return <div />
        }

        return (
          <Form>
            <CharacterSheet input={false} values={values} />
          </Form>
        )
      }}
    </Formik>
  )
}

const validatePassword = async (id, values) => {
  const shaObj = new jsSHA('SHA-256', 'TEXT')
  shaObj.update(values.passwordForUpdate)
  const hashForUpdate = shaObj.getHash('HEX')
  const editDocRef = db.collection('characters').doc(id)

  try {
    const snapshot = await editDocRef.get()
    let passwordOnServer
    if (snapshot.exists) {
      passwordOnServer = snapshot.data().password
    } else {
      throw new Error('document does not exist.')
    }

    if (passwordOnServer !== hashForUpdate) {
      console.log('wrong password.')
      throw new Error('wrong password.')
    }
  } catch (err) {
    console.error('Error :', err)
    throw err
  }
}

function EditCharForm() {
  document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=1024')
  const { id } = useParams()
  const [character, setCharacter] = useState(new Character())

  useEffect(() => {
    const docRef = db.collection('characters').doc(id)
    docRef.get().then((doc) => {
      if (doc.exists) {
        const character = Object.assign(new Character(), doc.data())
        setCharacter(character)
      } else {
        console.log('No such document!')
      }
    }).catch((error) => {
      console.log('Error getting document:', error)
    })
  }, [id])

  return (
    <Formik
      initialValues={character}
      enableReinitialize
      onSubmit={async (values, actions) => {
        try {
          await validatePassword(id, values)
        } catch (err) {
          actions.setFieldError('passwordForUpdate', 'パスワードが誤っています。')
          return
        }
        const editDocRef = db.collection('characters').doc(id)
        values.updateTime = new Date()
        values.id = editDocRef.id
        values.passwordForUpdate = ''
        editDocRef.set(JSON.parse(JSON.stringify(values)))
          .then(() => {
            console.log('Document successfully written!')
            document.location.href = '/'
          })
          .catch((error) => {
            console.error('Error writing document: ', error)
          })
      }}
    >
      {({ values, errors, ...props }) => {
        if (!values.id) {
          return <div />
        }

        return (
          <Form>
            <PromptIfDirty />
            <CharacterSheet input values={values} />
            <Label>パスワード</Label>
            <Field name="passwordForUpdate" type="password" component={TextField} size="small" margin="none" variant="outlined" />
            <br />
            <br />
            <Button onClick={props.handleSubmit} variant="contained" color="primary">保存</Button>
          </Form>
        )
      }}
    </Formik>
  )
}

function ListItemLink(props) {
  return <ListItem button component="a" {...props} />
}

function ListChars() {
  const [characters, setCharacters] = useState([])

  useEffect(() => {
    const unsubscribe = db.collection('characters')
      .orderBy('updateTime', 'desc')
      .onSnapshot((snapshot) => {
        const result = []
        snapshot.forEach((doc) => {
          result.push(doc.data())
        })
        setCharacters(result)
      })
    return unsubscribe
  }, [])

  return (
    <List>
      {characters.map((character) => (
        <ListItemLink href={`/char/${character.id}`} key={character.id}>
          <ListItemAvatar>
            <Avatar src={character.image} />
          </ListItemAvatar>
          <ListItemText primary={character.pcName} secondary={`PL名:${character.plName}, クラスレベル:${character.classLevel}`} />
          <ListItemSecondaryAction>
            <Button variant="contained" component={Link} to={`/editchar/${character.id}`}>
              編集
            </Button>
          </ListItemSecondaryAction>
        </ListItemLink>
      ))}
    </List>
  )
}

const DirtyDialog = (props) => {
  const [, setOpen] = useState(false)

  const handleCancel = () => {
    setOpen(false)
    props.onCancel()
  }

  const handleConfirm = () => {
    setOpen(false)
    props.onConfirm()
  }

  return (
    <Dialog
      open
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">未保存の変更があります</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {props.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary" autoFocus>
          編集に戻る
        </Button>
        <Button onClick={handleConfirm} color="primary">
          離れる
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const getUserConfirmation = (message, callback) => {
  const modal = document.createElement('div')
  document.body.appendChild(modal)

  const withCleanup = (answer) => {
    ReactDOM.unmountComponentAtNode(modal)
    document.body.removeChild(modal)
    callback(answer)
  }

  ReactDOM.render(
    <DirtyDialog
      message={message}
      onCancel={() => withCleanup(false)}
      onConfirm={() => withCleanup(true)}
    />,
    modal,
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <Router getUserConfirmation={getUserConfirmation}>
          <div>
            <Switch>
              <Route path="/char/:id">
                <Label><LinkToHome /></Label>
                <ViewCharForm />
              </Route>
              <Route path="/newchar">
                <Label><LinkToHome /></Label>
                <NewCharForm />
              </Route>
              <Route path="/editchar/:id">
                <Label><LinkToHome /></Label>
                <EditCharForm />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

function Home() {
  document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1')
  return (
    <>
      <Typography component="h3" variant="h4" align="center" color="textPrimary">
        D&amp;D 3.5版 キャラクターデータベース
      </Typography>
      <Grid container justify="center">
        <Button variant="contained" color="primary" component={Link} to="/newchar">
          新規作成
        </Button>
      </Grid>
      <br />
      <ListChars />
    </>
  )
}

function LinkToHome() {
  return (
    <>
      <Link to="/">キャラクター一覧へ</Link>
    </>
  )
}

function CharacterSheet({ input, values, ...props }) {
  const classes = useStyles()
  return (
    <div className={classes.bgslightgray}>
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
                <Grid container item key={index} spacing={1}>
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
              <Grid container item key={index} spacing={1}>
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
              <Grid container item key={index} spacing={1}>
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
              <Grid container item key={index} spacing={1}>
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
            <Stop style={{ fontSize: 12 }} />
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
          <Grid container item key={index} spacing={1}>
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
          <Grid container item xs={9} justify="center">
            <Label align="center">アイテム</Label>
          </Grid>
          <Grid container item xs={3} justify="center">
            <Label align="center">重量</Label>
          </Grid>
          {values.posessions.map((row, index) => (
            <Grid container item key={index} spacing={1}>
              <Grid container item xs={9} justify="center">
                <Value name={`posessions.${index}.item`} input={input} {...props} />
              </Grid>
              <Grid container item xs={3} justify="center">
                <Value name={`posessions.${index}.weight`} input={input} {...props} />
              </Grid>
            </Grid>
          ))}
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

const firebaseConfig = {
  apiKey: 'AIzaSyA8NGwQmCq5TF16lQy4fSAyti8zpHIwXqI',
  authDomain: 'dnd35-character-database.firebaseapp.com',
  databaseURL: 'https://dnd35-character-database.firebaseio.com',
  projectId: 'dnd35-character-database',
  storageBucket: 'dnd35-character-database.appspot.com',
  messagingSenderId: '551444495572',
  appId: '1:551444495572:web:5ef6070eb157db6da50f41',
  measurementId: 'G-0M7NMCXK1Y',
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

const db = firebase.firestore()
firebase.analytics()

// prevent back-forward cache in Safari
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    window.location.reload()
  }
})

ReactDOM.render(<App />, document.querySelector('#app'))
