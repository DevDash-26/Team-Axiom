type RoleGateProps = {
  allow: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/** Visibility only. Do not treat a hidden control as authorisation. */
export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  return allow ? children : fallback;
}
