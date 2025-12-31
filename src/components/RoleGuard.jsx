import { useAuth } from '../hooks/useAuth';

/**
 * Component to conditionally render children based on user roles
 * @param {Array<string>} allowedRoles - Array of allowed role names
 * @param {ReactNode} children - Children to render if user has required role
 * @param {ReactNode} fallback - Optional fallback to render if user doesn't have role
 */
const RoleGuard = ({ allowedRoles, children, fallback = null }) => {
    const { user } = useAuth();

    if (!user || !user.roles) {
        return fallback;
    }

    // Check if user has any of the allowed roles
    const hasRequiredRole = allowedRoles.some(role =>
        user.roles.includes(role)
    );

    return hasRequiredRole ? children : fallback;
};

export default RoleGuard;
