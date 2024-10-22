import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  user: { role: string } | null;
  children: JSX.Element;
  requiredRole?: string;  // Este prop verifica o papel
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ user, children, requiredRole }) => {
  if (!user) {
    return <Navigate to="/login" />;  // Redireciona para login se o usuário não estiver logado
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;  // Redireciona para home se o papel não for o esperado
  }

  return children;
};

export default PrivateRoute;