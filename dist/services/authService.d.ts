export declare class AuthService {
    private userRepository;
    private dataSource;
    constructor();
    private initRepositories;
    register(email: string, password: string, name: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: "user" | "admin";
        };
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: "user" | "admin";
        };
    }>;
    private generateAuthTokens;
}
