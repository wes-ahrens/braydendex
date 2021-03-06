'use strict'

const {
  Image,
  BasicCard,
  Button,
  List
} = require('actions-on-google')
const { handleError } = require('./util')
const api = require('../app/api')

const spriteMappings = {
  back_female: { friendly: 'Back View - Female', order: 4 },
  back_shiny_female: { friendly: 'Back View (Shiny) - Female', order: 8 },
  back_default: { friendly: 'Back View', order: 2 },
  front_female: { friendly: 'Front View - Female', order: 3 },
  front_shiny_female: { friendly: 'Front View (Shiny) - Female', order: 7 },
  back_shiny: { friendly: 'Back View (Shiny)', order: 6 },
  front_default: { friendly: 'Front View', order: 1 },
  front_shiny: { friendly: 'Front View (Shiny)', order: 5 }
}

async function pokemonSprites (conv) {
  console.log('Asking for sprites...')
  const params = conv.contexts.get('pokemon').parameters
  try {
    const sprites = await api.getSprites(params.pokedex)
    const items = Object.keys(sprites)
      .sort((a, b) => spriteMappings[a].order - spriteMappings[b].order)
      .filter(key => sprites[key] != null)
      .map(key_1 => {
        console.log('Found sprite ' + spriteMappings[key_1].friendly + ' : ' + sprites[key_1])
        return {
          friendly: spriteMappings[key_1].friendly,
          image: new Image({
            url: sprites[key_1],
            alt: 'Image of ' + params.name + ' ' + spriteMappings[key_1].friendly
          })
        }
      })
    const itemMap = spriteListItems(items)
    if (!conv.screen) {
      conv.ask('Sorry, Cannot show images on a device without a screen')
    } else {
      conv.ask(params.name + ' images')
      conv.ask(new List({
        title: params.name,
        items: itemMap
      }))
    }
    return Promise.resolve(conv)
  } catch (error) {
    return await handleError(conv, error,
      'Sorry, could not retrieve sprites for ' + params.name)
  }
}
exports.pokemonSprites = pokemonSprites

function spriteListItems (items) {
  const itemMap = {}
  items.forEach(item => {
    itemMap[item.image.url] = {
      synonyms: [item.friendly],
      title: item.friendly,
      description: item.friendly,
      image: item.image
    }
  })
  return itemMap
}

function spritesOption (conv, params, option) {
  const ctxParams = conv.contexts.get('pokemon').parameters
  const imgText = conv.contexts.get('actions_intent_option').parameters.text
  conv.ask('Summary of ' + ctxParams.name)
  conv.ask(new BasicCard({
    title: 'Name: ' + ctxParams.name,
    subtitle: 'Pokedex: ' + ctxParams.pokedex,
    text: ctxParams.name + ' ' + imgText,
    buttons: new Button({
      title: 'View on pokemondb',
      url: 'https://pokemondb.net/pokedex/' + ctxParams.pokedex
    }),
    image: new Image({
      url: option,
      alt: ctxParams.name + ' ' + imgText
    }),
    display: 'CROPPED'
  }))
  Promise.resolve(conv)
}
exports.spritesOption = spritesOption
