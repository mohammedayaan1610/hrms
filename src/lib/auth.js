import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        await connectDB();

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          department: user.department,
          designation: user.designation,
          phone: user.phone || "",
          joiningDate: user.joiningDate || "",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.employeeId = user.employeeId;
        token.department = user.department;
        token.designation = user.designation;
        token.phone = user.phone;
        token.joiningDate = user.joiningDate;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.employeeId = token.employeeId;
        session.user.department = token.department;
        session.user.designation = token.designation;
        session.user.phone = token.phone;
        session.user.joiningDate = token.joiningDate;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
