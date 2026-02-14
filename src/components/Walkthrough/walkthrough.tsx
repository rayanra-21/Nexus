import React, { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useAuth } from "../../context/AuthContext";

const Walkthrough: React.FC = () => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (!hasSeenTour && user) {
      setRun(true);
    }
  }, [user]);

  const steps: Step[] = [
    {
      target: ".tour-navbar",
      content: "This is the top navigation bar. You can access important pages from here.",
      placement: "bottom",
    },
    {
      target: ".tour-sidebar",
      content: "This is the sidebar menu. It contains your dashboard navigation links.",
      placement: "right",
    },
    {
      target: ".tour-dashboard-main",
      content: "This is your dashboard area where all main content appears.",
      placement: "top",
    },
    {
      target: ".tour-dashboard-btn",
      content: "Use this button to explore startups/investors quickly.",
      placement: "left",
    },
    {
      target: ".tour-search",
      content: "You can search and filter users using this search bar.",
      placement: "bottom",
    },
    {
      target: ".tour-wallet",
      content: "This is your wallet balance card. You can track your funds here.",
      placement: "top",
    },
  ];

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem("hasSeenTour", "true");
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={handleCallback}
      styles={{ options: { zIndex: 9999 } }}
    />
  );
};

export default Walkthrough;
