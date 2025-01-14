const navigationConfig = {
  admin: [
    // {
    //   component: "CNavItem",
    //   to: "/pm/dashboard",
    //   name: "Dashboard",
    //   icon: "cilGlobeAlt",
    //   parentId: "ROOT",
    // },
    {
      component: "CNavItem",
      to: "/pm/machine",
      name: "Monitoring & Alert System",
      icon: "cilChartLine",
      parentId: "ROOT",
    },
    // {
    //   component: "CNavItem",
    //   to: "/pm/activity-tm",
    //   name: "Activity Board - TM",
    //   icon: "cilTask",
    //   parentId: "ROOT",
    // },
    // {
    //   component: "CNavItem",
    //   to: "/pm/activity-tm2",
    //   name: "Activity Board - TM",
    //   icon: "cilTask",
    //   parentId: "ROOT",
    // },
    // {
    //   component: "CNavItem",
    //   to: "/pm/activity-tl",
    //   name: "Activity Board - TL",
    //   icon: "cilTask",
    //   parentId: "ROOT",
    // },
    // {
    //   component: "CNavItem",
    //   to: "/pm/activity-tl2",
    //   name: "Activity Board - TL",
    //   icon: "cilTask",
    //   parentId: "ROOT",
    // },
    {
      component: "CNavItem",
      to: "/pm/calendar",
      name: "Calendar",
      icon: "cilCalendar",
      parentId: "ROOT",
    },
    // {
    //   component: "CNavGroup",
    //   name: "PM Schedule",
    //   icon: "cilCalendarCheck",
    //   items: [
    //     {
    //       component: "CNavItem",
    //       to: "/pm/workload",
    //       name: "PM Workload",
    //       icon: "cilChart",
    //     },
    // {
    //   component: "CNavItem",
    //   to: "/pm/yearly",
    //   name: "Yearly",
    //   icon: "cilCalendar",
    // },
    // {
    //   component: "CNavItem",
    //   to: "/pm/monthly",
    //   name: "Monthly",
    //   icon: "cilCalendar",
    // },
    //   ],
    // },
    // {
    //   component: "CNavItem",
    //   to: "/pm/bira",
    //   name: "BIRA Problem",
    //   icon: "cilWarning",
    //   parentId: "ROOT",
    // },
    {
      component: "CNavItem",
      to: "/pm/history",
      name: "PM History",
      icon: "cilHistory",
      parentId: "ROOT",
    },
    {
      component: "CNavGroup",
      name: "Master Data",
      icon: "cilFolder",
      items: [
        {
          component: "CNavItem",
          to: "/pm/master-machine",
          name: "Equipments",
          icon: "cilFactory",
        },
        // {
        //   component: "CNavItem",
        //   to: "/pm/master-sop",
        //   name: "SOPs",
        //   icon: "cilFile",
        // },
        {
          component: "CNavItem",
          to: "/pm/master-sparepart",
          name: "Spare Parts",
          icon: "cilCog",
        },
        {
          component: "CNavItem",
          to: "/pm/master-tools",
          name: "Tools",
          icon: "cilCog",
        },
      ],
    },
    {
      component: "CNavItem",
      to: "/pm/user-management",
      name: "User Management",
      icon: "cilPeople",
      parentId: "ROOT",
    },
    {
      component: "CNavItem",
      to: "/pm/change-log",
      name: "Change Log",
      icon: "cilNotes",
      parentId: "ROOT",
    },
  ],

  team_leader: [
    // {
    //   component: "CNavItem",
    //   to: "/pm/dashboard",
    //   name: "Dashboard",
    //   icon: "cilGlobeAlt",
    //   parentId: "ROOT",
    // },
    {
      component: "CNavItem",
      to: "/pm/machine",
      name: "Monitoring & Alert System",
      icon: "cilChartLine",
      parentId: "ROOT",
    },
    // {
    //   component: "CNavItem",
    //   to: "/pm/activity-tl",
    //   name: "Activity Board - TL",
    //   icon: "cilTask",
    //   parentId: "ROOT",
    // },
    {
      component: "CNavItem",
      to: "/pm/activity-tl2",
      name: "Activity Board - TL",
      icon: "cilTask",
      parentId: "ROOT",
    },
    {
      component: "CNavItem",
      to: "/pm/calendar",
      name: "Calendar",
      icon: "cilCalendar",
      parentId: "ROOT",
    },
    // {
    //   component: "CNavGroup",
    //   name: "PM Schedule",
    //   icon: "cilCalendarCheck",
    //   items: [
    //     {
    //       component: "CNavItem",
    //       to: "/pm/workload",
    //       name: "PM Workload",
    //       icon: "cilChart",
    //     },
    // {
    //   component: "CNavItem",
    //   to: "/pm/yearly",
    //   name: "Yearly",
    //   icon: "cilCalendar",
    // },
    // {
    //   component: "CNavItem",
    //   to: "/pm/monthly",
    //   name: "Monthly",
    //   icon: "cilCalendar",
    // },
    //   ],
    // },
    // {
    //   component: "CNavItem",
    //   to: "/pm/bira",
    //   name: "BIRA Problem",
    //   icon: "cilWarning",
    //   parentId: "ROOT",
    // },
    {
      component: "CNavItem",
      to: "/pm/history",
      name: "PM History",
      icon: "cilHistory",
      parentId: "ROOT",
    },
    // {
    //   component: "CNavGroup",
    //   name: "Master Data",
    //   icon: "cilFolder",
    //   items: [
    // {
    //   component: "CNavItem",
    //   to: "/pm/master-machine",
    //   name: "Equipments",
    //   icon: "cilFactory",
    // },
    // {
    //   component: "CNavItem",
    //   to: "/pm/master-sop",
    //   name: "SOPs",
    //   icon: "cilFile",
    // },
    // {
    //   component: "CNavItem",
    //   to: "/pm/master-sparepart",
    //   name: "Spare Parts",
    //   icon: "cilCog",
    // },
    // {
    //   component: "CNavItem",
    //   to: "/pm/master-tools",
    //   name: "Tools",
    //   icon: "cilCog",
    // },
    // ],
    // },
  ],

  team_member: [
    // {
    //   component: "CNavItem",
    //   to: "/pm/dashboard",
    //   name: "Dashboard",
    //   icon: "cilGlobeAlt",
    //   parentId: "ROOT",
    // },
    {
      component: "CNavItem",
      to: "/pm/machine",
      name: "Monitoring & Alert System",
      icon: "cilChartLine",
      parentId: "ROOT",
    },
    // {
    //   component: "CNavItem",
    //   to: "/pm/activity-tm",
    //   name: "Activity Board - TM",
    //   icon: "cilTask",
    //   parentId: "ROOT",
    // },
    {
      component: "CNavItem",
      to: "/pm/activity-tm2",
      name: "Activity Board - TM",
      icon: "cilTask",
      parentId: "ROOT",
    },
  ],
};

export const getNavigationItems = (role) => {
  return navigationConfig[role] || [];
};
