const { JsonWebTokenError } = require('jsonwebtoken')
const AuthService = require('../auth/auth-service')

async function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || ''
  console.log('This is the authtoken', authToken)

  let bearerToken
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' })
  } else {
    bearerToken = authToken.slice(7, authToken.length)
  }

  try {
    const payload = AuthService.verifyJwt(bearerToken)

    const user = await AuthService.getUserWithUserName(
      req.app.get('db'),
      payload.sub,
    )
    console.log('this is the user', user)

    if (!user)
      return res.status(401).json({ error: 'Case 1' })

    req.user = user
    next()
  } catch (error) {
    if (error instanceof JsonWebTokenError)
      return res.status(401).json({ error: 'Case 2' })

    next(error)
  }
}

module.exports = {
  requireAuth,
}
