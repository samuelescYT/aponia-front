import { HttpContextToken } from "@angular/common/http";

export const REQUIRE_CREDENTIALS = new HttpContextToken<boolean>(() => false);
