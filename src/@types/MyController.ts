export type MyController = (req: MyRequest, res: MyResponse) => Promise<void> | void;

export type MyAuthController = (req: MyAuthRequest, res: MyResponse) => Promise<void> | void;
