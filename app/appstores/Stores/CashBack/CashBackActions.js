/**
 * @version 0.42
 */
import store from '@app/store'

const { dispatch } = store

const cashBackActions = {

    updateAll : async (data, source) => {
        dispatch({
            type: 'SET_CASHBACK_ALL',
            data
        })
    }
}
export default cashBackActions
