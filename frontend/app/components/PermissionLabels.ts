export type Permission = {
  id: string;
  code: string;
  name: string;
};

export const permissionLabels: Record<string, string> = {
  "clients.read": "查看客户 / Ver clientes",
  "clients.write": "新增、编辑、删除客户 / Criar, editar e excluir clientes",
  "opportunities.read": "查看商机 / Ver oportunidades",
  "opportunities.write": "新增、编辑、删除商机 / Criar, editar e excluir oportunidades",
  "requirements.read": "查看需求、报价、保单 / Ver necessidades, cotações e apólices",
  "requirements.write": "管理需求、报价、分配和保单 / Gerenciar necessidades, cotações, distribuições e apólices",
  "tasks.read": "查看任务 / Ver tarefas",
  "tasks.write": "新增、编辑、删除任务 / Criar, editar e excluir tarefas",
  "users.read": "查看用户和用户组 / Ver usuários e grupos",
  "users.write": "管理用户、用户组和权限 / Gerenciar usuários, grupos e permissões",
  "audit.read": "查看审计记录 / Ver auditoria"
};

export const groupLabels: Record<string, string> = {
  clients: "客户 / Clientes",
  opportunities: "商机 / Oportunidades",
  requirements: "需求、报价、保单 / Necessidades, cotações e apólices",
  tasks: "任务 / Tarefas",
  users: "用户与权限 / Usuários e permissões",
  audit: "审计 / Auditoria",
  other: "其他 / Outros"
};

export function permissionGroup(code: string) {
  return code.split(".")[0] || "other";
}

export function permissionLabel(permission: Permission) {
  return permissionLabels[permission.code] || permission.name || permission.code;
}

export function groupPermissions(permissions: Permission[]) {
  return permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
    const group = permissionGroup(permission.code);
    groups[group] = [...(groups[group] || []), permission];
    return groups;
  }, {});
}
