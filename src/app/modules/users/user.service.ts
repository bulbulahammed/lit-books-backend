import bcrypt from 'bcrypt'
import ApiError from '../../../errors/apiError'
import { generateToken } from '../../../utils/generateToken'
import { IUser } from './user.interface'
import { User } from './user.model'

const signUp = async (user: IUser): Promise<IUser | null> => {
  const { password, ...rest } = user
  const saltRounds = 10
  // Hash the password using bcrypt
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  // Create a new user object with the hashed password
  const newUser = {
    ...rest,
    password: hashedPassword,
  }
  try {
    const createdUser = await User.create(newUser)
    return createdUser
  } catch (error) {
    throw new ApiError(400, 'Failed to Sign Up')
  }
}

// Login Service
type LoginResult = {
  user: IUser
  token: string
}
const login = async (user: IUser): Promise<LoginResult | null> => {
  try {
    // Find the user by their email
    const loggedInUser = await User.findOne({
      email: user.email,
    })

    // If the user is not found, or if the password is incorrect, return null
    if (
      !loggedInUser ||
      !(await bcrypt.compare(user.password, loggedInUser.password))
    ) {
      throw new ApiError(400, 'Failed to Login')
    }

    // Generate a JWT token for the user
    const token = generateToken(loggedInUser.id)

    // Return the JWT token
    return { token, user: loggedInUser }
  } catch (error) {
    throw new ApiError(400, 'Failed to Login')
  }
}

export const UserService = {
  signUp,
  login,
}
