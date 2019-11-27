const { JsonWebTokenError } = require('jsonwebtoken')
const membersAuthService = require('../auth-members/members-auth-service')

async function requireMemberAuth(req, res, next) {
  const authToken = req.get('Authorization') || ''

  let bearerToken
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' })
  } else {
    bearerToken = authToken.slice(7, authToken.length)
  }

  try {
    const payload = membersAuthService.verifyJwt(bearerToken)

    const user = await membersAuthService.getUserWithUserName(
      req.app.get('db'),
      payload.sub,
    )

    if (!user)
      return res.status(401).json({ error: 'Unauthorized request' })

    req.user = user
    next()
  } catch (error) {
    if (error instanceof JsonWebTokenError)
      return res.status(401).json({ error: 'Unauthorized request' })

    next(error)
  }
}

module.exports = {
  requireMemberAuth,
}
