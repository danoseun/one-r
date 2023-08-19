/* eslint-disable no-console */
import inquirer from 'inquirer'

import {addRoleToUser, isEmailValid} from '../src/helpers/tools'
import db from '../db/models'
import DataService from '../src/services/DataService'
import FirmService from '../src/services/FirmService'

const questions = [
  {
    type: 'list',
    name: 'welcome',
    message: 'Welcome to WhatsApp Platform setup!',
    choices: [
      new inquirer.Separator('Please select the action you want to perform'),
      {
        name: 'Admin'
      },
      {
        name: 'Firm'
      }
    ]
  },
  {
    type: 'input',
    name: 'email',
    message: 'Please Enter Admin Email',
    when: answers => answers.welcome === 'Admin'
  },
  {
    type: 'password',
    name: 'password',
    mask: '*',
    message: 'Please Enter Admin Password',
    when: answers => answers.welcome === 'Admin'
  },
  {
    type: 'password',
    name: 'confirmPassword',
    mask: '*',
    message: 'Please Confirm Admin Password',
    when: answers => answers.welcome === 'Admin'
  },
  {
    type: 'input',
    name: 'firstName',
    message: 'Please Enter Admin First Name',
    when: answers => answers.welcome === 'Admin'
  },
  {
    type: 'input',
    name: 'lastName',
    message: 'Please Enter Admin Last Name',
    when: answers => answers.welcome === 'Admin'
  },
  {
    type: 'input',
    name: 'name',
    message: 'Please enter firm name',
    when: answers => answers.welcome === 'Firm'
  },
  {
    type: 'input',
    name: 'domain',
    message: 'Please enter firm domain (eg. doe.com)',
    when: answers => answers.welcome === 'Firm'
  }
]

inquirer.prompt(questions).then(async answers => {
  const {welcome, ...payload} = answers

  if (welcome === 'Admin') {
    const user = new DataService(db.User)
    const {confirmPassword, ...rest} = payload

    if (payload.password === confirmPassword && isEmailValid(payload.email)) {
      const adminPayload = await addRoleToUser({...rest, status: 'confirmed'}, 'admin')

      user.addResource(adminPayload).then(() => {
        console.log('-'.repeat(80))
        console.log('Admin User setup was successful!')
        console.log('-'.repeat(80))
      })
    } else {
      console.log('-'.repeat(80))
      console.log('Confirm Password does not match Password or Email is invalid. Please try again')
      console.log('-'.repeat(80))
    }
  } else {
    const firm = new FirmService(db.Firm)

    firm.addFirm({...payload, status: 'active'}).then(data => {
      console.log('-'.repeat(80))
      console.log(`${data.name} was successfully created!`)
      console.log('-'.repeat(80))
    })
  }
})
