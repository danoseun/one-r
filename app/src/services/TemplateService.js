import DataService from './DataService'

class TemplateService extends DataService {
  constructor(model, currentUser = {}) {
    super(model)

    this.currentUser = currentUser
  }

  addTemplate(payload) { return this.create({...payload, firm_id: this.currentUser.firm_id}) }

  fetchTemplate(id) {
    return this.show({id}).then(template => {
      if (this.isMemberOfFirm(template))
        return template
      else
        throw new Error('Current User cannot view this template.')
    })
  }

  isMemberOfFirm(template) { return template.firm_id === this.currentUser.firm_id }

  updateTemplate(id, payload) {
    return this.show({id}).then(template => {
      if (this.isMemberOfFirm(template))
        return template.update(payload)
      else
        throw new Error('Current User cannot view this template.')
    })
  }
}

export default TemplateService
