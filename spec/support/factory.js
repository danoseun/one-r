import faker from 'faker'

/**
 * Base factory method for generating random values for various attribute types
 * @param {String} type - Attribute which a random value needs to be generated
 * @returns {String|Number}
 */
export const dataFactory = type => {
  const password = faker.internet.password()

  switch (type) {
    case 'email':
      return faker.internet.email().toLowerCase()
    case 'firstName':
      return faker.name.firstName()
    case 'lastName':
      return faker.name.lastName()
    case 'domain':
      return faker.internet.domainName()
    case 'name':
      return faker.company.companyName()
    case 'phone':
      return faker.phone.phoneNumber()
    case 'password':
      return password
    default:
      return faker.random.words()
  }
}
