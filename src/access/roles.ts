import type { Access, FieldAccess } from 'payload'

type Role = 'admin' | 'editor' | 'author' | 'viewer'

type UserWithRoles = {
  roles?: Role[] | null
}

const roleRank: Record<Role, number> = {
  viewer: 0,
  author: 1,
  editor: 2,
  admin: 3,
}

export const hasRole = (user: UserWithRoles | null | undefined, roles: Role[]) => {
  return Boolean(user?.roles?.some((role) => roles.includes(role)))
}

export const hasMinimumRole = (user: UserWithRoles | null | undefined, role: Role) => {
  const requiredRank = roleRank[role]
  return Boolean(user?.roles?.some((userRole) => roleRank[userRole] >= requiredRank))
}

export const admins: Access = ({ req: { user } }) => {
  return hasRole(user as UserWithRoles | null | undefined, ['admin'])
}

export const adminsOrSelf: Access = ({ id, req: { user } }) => {
  if (hasRole(user as UserWithRoles | null | undefined, ['admin'])) return true
  if (!user?.id) return false

  return {
    id: {
      equals: id || user.id,
    },
  }
}

export const editorsAndAdmins: Access = ({ req: { user } }) => {
  return hasMinimumRole(user as UserWithRoles | null | undefined, 'editor')
}

export const editorsAndAdminsField: FieldAccess = ({ req: { user } }) => {
  return hasMinimumRole(user as UserWithRoles | null | undefined, 'editor')
}

export const authorsEditorsAndAdmins: Access = ({ req: { user } }) => {
  return hasMinimumRole(user as UserWithRoles | null | undefined, 'author')
}

export const authorsOwnPostsOrEditors: Access = ({ req: { user } }) => {
  if (hasMinimumRole(user as UserWithRoles | null | undefined, 'editor')) return true
  if (!hasMinimumRole(user as UserWithRoles | null | undefined, 'author') || !user?.id) return false

  return {
    authors: {
      contains: user.id,
    },
  }
}

export const canUpdateRoles: FieldAccess = ({ req: { user } }) => {
  return hasRole(user as UserWithRoles | null | undefined, ['admin'])
}
