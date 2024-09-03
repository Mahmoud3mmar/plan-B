import { SetMetadata } from "@nestjs/common";
import { Role } from "../user/common utils/Role.enum";

export const Roles =(...Roles:Role[])=> SetMetadata('roles',Roles)