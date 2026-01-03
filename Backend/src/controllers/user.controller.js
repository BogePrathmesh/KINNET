import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";

/* ===================== LOGIN ===================== */
const login = async (req, res) => {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
        return res
            .status(httpStatus.BAD_REQUEST)
            .json({ message: "Username and password are required" });
    }

    try {
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res
                .status(httpStatus.NOT_FOUND)
                .json({ message: "User not found" });
        }

        // Compare password (ASYNC)
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = crypto.randomBytes(20).toString("hex");
            user.token = token;

            await user.save();

            return res
                .status(httpStatus.OK)
                .json({ token });
        }
        else {
            return res.status(httpStatus.UNAUTHORIZED)
        }

        // Generate token

    } catch (e) {
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: `Something went wrong: ${e.message}` });
    }
};

/* ===================== REGISTER ===================== */
const register = async (req, res) => {
    const { name, username, password } = req.body;

    // Validation
    if (!name || !username || !password) {
        return res
            .status(httpStatus.BAD_REQUEST)
            .json({ message: "All fields are required" });
    }

    try {
        // Check existing user
        const existUser = await User.findOne({ username });
        if (existUser) {
            return res
                .status(httpStatus.CONFLICT)
                .json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            name,
            username,
            password: hashedPassword,
        });

        await newUser.save();

        return res
            .status(httpStatus.CREATED)
            .json({ message: "User registered successfully" });
    } catch (e) {
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: `Something went wrong: ${e.message}` });
    }
};

export { login, register };
