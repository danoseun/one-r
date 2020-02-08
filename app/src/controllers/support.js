import axios from 'axios'
import {OK, UNPROCESSABLE_ENTITY} from '../constants/statusCodes'
import {addBaseUrlToImages} from '../helpers/tools'

require('dotenv').config()

const support = {
  cars: (req, res) => {
    axios.get(
      `${process.env.CARS_API_BASE_URL}/index.php?route=api/product/getproduct&sku=${req.query.sku}`,
      {headers: {apikey: process.env.CARS_API_KEY}}
    ).then(response => res.status(OK).send({data: addBaseUrlToImages(response.data[0]), message: null, success: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'SKU might be missing'}))
  }
}

export default support
