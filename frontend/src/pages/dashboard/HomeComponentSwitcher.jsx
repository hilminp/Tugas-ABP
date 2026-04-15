import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import DashboardAnonim from './DashboardAnonim';
import DashboardPsikolog from './DashboardPsikolog';

const HomeComponentSwitcher = () => {
    const { user } = useAuth();
    
    // Default fallback to anonim if no role is found (or handle appropriately)
    if (user?.role === 'psikolog') {
        return <DashboardPsikolog />;
    }
    
    return <DashboardAnonim />;
};

export default HomeComponentSwitcher;
