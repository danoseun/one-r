/** @class BaseService
 * @property {Model} model - Sequelize Model
 * @description
 * Serves as an interface for database actions like FIND, UPDATE, DESTROY
 * @example
 * const roleService = new BaseService(db.Role)
 */

class DataService {
  constructor(model) {
    this.model = model
  }

  /**
   * Find or create a new record in database
   * @param {Object} resource - required
   * @returns {Promise}
   */
  create(resource) {
    const column = Object.keys(resource)[0]

    return this.model.findOrCreate({where: {[column]: resource[column]}, defaults: resource})
  }

  /**
   * Returns record from database based on identfier
   * @param {Object} resourceIdentifier - required
   * @returns {Promise}
   */
  show(resourceIdentifier, options = {}, additionalClause = {}) {
    const [column] = Object.keys(resourceIdentifier)

    return this.model.findOne({where: {[column]: resourceIdentifier[column], ...additionalClause}, ...options})
  }

  /**
   * Returns all database record(s) in the specified model
   * @param {Object} options - optional
   * @returns {Promise}
   */
  index(options = {}) { return this.model.findAll(options) }

  /**
   * Updates database recored of the specified identifier
   * @param {Object} resourceIdentifier - required
   * @param {Object} updateParams - required
   * @returns {Promise}
   */
  update(resourceIdentifier, updateParams) {
    return this.show(resourceIdentifier).then(resource => resource.update(updateParams))
  }

  /**
   * Irreversibly destroys database record of the specified identifier
   * @param {Object} resourceIdentifier - required
   * @returns {Promise}
   */
  destroy(resourceIdentifier) {
    return this.show(resourceIdentifier).then(resource => resource.destroy())
  }

  addResource(resource) { return this.model.create(resource) }
}

export default DataService
