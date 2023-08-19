import {dataFactory} from '../factory'

/**
 * Factory method for generating a new record with specified attributes
 * @param {Array<String>} attributes - Attributes that needs to be present on a new record
 * @returns {Object}
 */
const record = attributes => {
  let generatedRecord = {}

  attributes.forEach(attribute => generatedRecord = {...generatedRecord, [attribute]: dataFactory(attribute)})

  return generatedRecord
}

export default record
