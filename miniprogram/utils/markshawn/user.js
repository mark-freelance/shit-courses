import {collUsers} from './db'

let userId = undefined

/**
 * @typedef User
 * @type {object}
 * @property {string} _openid
 * @property {string[]} m_clearance - bought modules
 * @see https://jsdoc.app/tags-type.html
 */

/**
 * todo: return string instead of user
 * @returns {string}
 */
export const asyncGetUserId = async () => {
	if (!userId) {
		const {result} = await wx.cloud.callFunction({name: 'login'})
		const {openid} = result
		userId = openid
	}
	return userId
}

/**
 *
 * @returns {Promise<User>}
 */
export const asyncGetUser = async () => {
	const userId = await asyncGetUserId()
	// todo: use _openid as the key to increase the query speed
	const {data: users} = await collUsers.where({"_openid": userId}).get()
	console.log('fetchUser: ', users)
	if (users.length !== 1) throw new Error(`user should be sole`)
	return users[0]
}
