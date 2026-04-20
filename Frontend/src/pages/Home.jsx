import React, { useState, useEffect, useMemo, memo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import Button from "../components/Button";
import Card from "../components/Card";
import Lenis from 'lenis';
import { FaWhatsapp, FaEnvelope, FaPhone, FaRocket, FaShieldAlt, FaCode, FaCheckCircle, FaClock, FaChartLine, FaHandshake } from 'react-icons/fa';
import SectionTestimonials from "../components/SectionTestimonials";