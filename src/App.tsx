import { useState, useMemo, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { AppScreen, Stage } from './types/job';
import { useJobTracker } from './hooks/useJobTracker';
import { useAuth } from './hooks/useAuth';
import { TopBar } from './components/TopBar';
import { BottomTabBar } from './components/BottomTabBar';
import { ScreenMode, ScreenModeToggle } from './components/ScreenModeToggle';
import { FilterToolbar } from './components/FilterToolbar';
import { PipelineBoard } from './components/PipelineBoard';
import { ApplicationsTable } from './components/ApplicationsTable';
import { ResumesScreen } from './components/ResumesScreen';
import { InsightsScreen } from './components/InsightsScreen';
import { ApplicationDrawer } from './components/ApplicationDrawer';
import { AddApplicationModal } from './components/AddApplicationModal';
import { AttentionAndInterviewsStrip } from './components/AttentionAndInterviewsStrip';
import { LoginPage } from './components/LoginPage';

const SCREEN_MODE_STORAGE_KEY = 'findmeajob_screen_mode_v1';

const SCREEN_TITLES: Record<AppScreen, { title: string; subtitle: string }> = {
  pipeline: {
    title: 'Job Search Pipeline',
    subtitle:
      'Move roles from Saved through Offer, compare compensation bands, and capture feedback after every interview round.',
  },
  applications: {
    title: 'Applications Ledger',
    subtitle:
      'Sort opportunities, update stages in bulk, review follow-up dates, and export your search history to CSV.',
  },
  resumes: {
    title: 'Resume Variants',
    subtitle:
      'Tie each tailored resume to the roles you sent it to and track which positioning converts to interviews.',
  },
  insights: {
    title: 'Search Insights',
    subtitle:
      'Conversion rates from application to offer, base pay spread across opportunities, and a full round-by-round log.',
  },
};

export default function App() {
  const { user, signIn, register, signInDemo, signOut } = useAuth();
  const {
    applications,
    filteredApplications,
    resumes,
    filters,
    setFilters,
    resetFilters,
    addApplication,
    updateApplication,
    moveStage,
    bulkMoveStage,
    bulkDeleteApplications,
    deleteApplication,
    duplicateApplication,
    addRoundNote,
    updateRoundNote,
    deleteRoundNote,
    addResume,
    updateResume,
    deleteResume,
    resetDemoData,
    clearAllApplications,
    exportCSV,
  } = useJobTracker();

  const [screenMode, setScreenMode] = useState<ScreenMode>(() => {
    try {
      const saved = window.localStorage.getItem(SCREEN_MODE_STORAGE_KEY);
      return saved === 'desktop' ? 'desktop' : 'mobile';
    } catch {
      return 'mobile';
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(SCREEN_MODE_STORAGE_KEY, screenMode);
    } catch {
      // Ignore storage errors
    }
  }, [screenMode]);

  const isMobileMode = screenMode === 'mobile';

  const [activeScreen, setActiveScreen] = useState<AppScreen>('pipeline');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalStage, setAddModalStage] = useState<Stage>('Saved');
  const [notice, setNotice] = useState<string | null>(null);

  const selectedApplication = useMemo(
    () => applications.find((a) => a.id === selectedAppId) ?? null,
    [applications, selectedAppId]
  );

  const showNotice = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => {
      setNotice((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  const handleOpenAddModal = (stage: Stage = 'Saved') => {
    setAddModalStage(stage);
    setAddModalOpen(true);
  };

  const handleMoveStage = (id: string, nextStage: Stage) => {
    const app = applications.find((a) => a.id === id);
    if (!app || app.stage === nextStage) return;
    moveStage(id, nextStage);
    showNotice(`Moved ${app.company} to ${nextStage}`);
  };

  const handleFilterByResume = (resumeId: string) => {
    setFilters({
      ...filters,
      resumeVersionId: resumeId,
    });
    setActiveScreen('pipeline');
  };

  const handleResetDemo = () => {
    resetDemoData();
    showNotice('Sample pipeline restored to browser storage');
  };

  const handleClearAll = () => {
    clearAllApplications();
    setSelectedAppId(null);
    showNotice('Cleared all applications from local storage');
  };

  const handleNavigate = (screen: AppScreen) => {
    if (screen === 'pipeline' && filters.stage !== 'All') {
      setFilters({ ...filters, stage: 'All' });
    }
    setActiveScreen(screen);
  };

  const summary = useMemo(() => {
    const interviews = applications.filter(
      (a) => a.stage === 'Interview'
    ).length;
    const offers = applications.filter((a) => a.stage === 'Offer').length;
    const totalRounds = applications.reduce(
      (sum, a) => sum + a.roundNotes.length,
      0
    );
    return {
      total: applications.length,
      interviews,
      offers,
      totalRounds,
    };
  }, [applications]);

  const headerMeta = SCREEN_TITLES[activeScreen];

  if (!user) {
    return (
      <LoginPage
        onSignIn={signIn}
        onRegister={register}
        onDemoSignIn={signInDemo}
        screenMode={screenMode}
        onChangeScreenMode={setScreenMode}
      />
    );
  }

  return (
    <div className={isMobileMode ? 'min-h-screen bg-[#f3f4f6] text-[#0f172a]' : 'min-h-screen flex flex-col bg-[#f9fafb] text-[#0f172a]'}>
      <div
        className={
          isMobileMode
            ? 'max-w-[430px] mx-auto min-h-screen flex flex-col bg-[#f9fafb] border-x border-[#e5e7eb] shadow-[0_8px_30px_rgba(15,23,42,0.08)]'
            : 'min-h-screen flex flex-col w-full'
        }
      >
        <TopBar
          activeScreen={activeScreen}
          onNavigate={handleNavigate}
          onOpenAddModal={() => handleOpenAddModal('Saved')}
          isMobileMode={isMobileMode}
        />

        <main
          className={
            isMobileMode
              ? 'flex-1 w-full px-4 py-4 space-y-4'
              : 'flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-6 space-y-5'
          }
        >
          {/* Workspace Context Header */}
          <div
            className={`flex gap-3 ${
              isMobileMode
                ? 'flex-col'
                : 'flex-col md:flex-row md:items-end justify-between gap-4'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1
                  className={`${
                    isMobileMode ? 'text-xl' : 'text-2xl sm:text-[28px]'
                  } font-extrabold tracking-[-0.02em] text-[#0f172a] [text-wrap:balance]`}
                >
                  {headerMeta.title}
                </h1>
                {!isMobileMode && (
                  <p className="text-sm text-[#4b5563] mt-1 max-w-2xl">
                    {headerMeta.subtitle}
                  </p>
                )}
              </div>
              {isMobileMode && (
                <ScreenModeToggle mode={screenMode} onChange={setScreenMode} />
              )}
            </div>

            {/* Quiet Tabular Summary Strip & Account Session */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-[#6b7280] tabular-nums shrink-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div>
                  Roles{' '}
                  <span className="font-mono font-bold text-[#0f172a]">
                    {summary.total}
                  </span>
                </div>
                <div>
                  In Interview{' '}
                  <span className="font-mono font-bold text-[#0f172a]">
                    {summary.interviews}
                  </span>
                </div>
                <div>
                  Offers{' '}
                  <span className="font-mono font-bold text-[#059669]">
                    {summary.offers}
                  </span>
                </div>
                {!isMobileMode && (
                  <div>
                    Rounds Logged{' '}
                    <span className="font-mono font-bold text-[#0f172a]">
                      {summary.totalRounds}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isMobileMode && (
                  <ScreenModeToggle mode={screenMode} onChange={setScreenMode} />
                )}
                {!isMobileMode && (
                  <span className="font-medium text-[#0f172a] truncate max-w-[140px]">
                    {user.name}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAppId(null);
                    signOut();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#4b5563] hover:text-[#0f172a] bg-white border border-[#e5e7eb] hover:border-[#0f172a] rounded-md transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Interviews Summary & Follow-up/Idle Alerts */}
          {(activeScreen === 'pipeline' || activeScreen === 'applications') && (
            <AttentionAndInterviewsStrip
              applications={applications}
              activeAttentionFilter={filters.attention}
              onSelectAttentionFilter={(attention) =>
                setFilters({ ...filters, attention })
              }
              onSelectApplication={(app) => setSelectedAppId(app.id)}
              isMobileMode={isMobileMode}
            />
          )}

          {/* Search & Filters Toolbar on Pipeline and Applications Screens */}
          {(activeScreen === 'pipeline' || activeScreen === 'applications') && (
            <FilterToolbar
              filters={filters}
              onChange={setFilters}
              onReset={resetFilters}
              resumes={resumes}
              totalCount={applications.length}
              filteredCount={filteredApplications.length}
              showStageFilter={activeScreen === 'applications'}
              isMobileMode={isMobileMode}
            />
          )}

          {/* Active Screen Viewport */}
          {activeScreen === 'pipeline' && (
            <PipelineBoard
              applications={filteredApplications}
              onMoveStage={handleMoveStage}
              onSelectApplication={(app) => setSelectedAppId(app.id)}
              onAddToStage={(stage) => handleOpenAddModal(stage)}
              isMobileMode={isMobileMode}
            />
          )}

          {activeScreen === 'applications' && (
            <ApplicationsTable
              applications={filteredApplications}
              onSelectApplication={(app) => setSelectedAppId(app.id)}
              onMoveStage={handleMoveStage}
              onBulkMoveStage={(ids, stage) => {
                bulkMoveStage(ids, stage);
                showNotice(`Moved ${ids.length} roles to ${stage}`);
              }}
              onBulkDelete={(ids) => {
                bulkDeleteApplications(ids);
                showNotice(`Deleted ${ids.length} roles`);
              }}
              onExportCSV={() => {
                exportCSV();
                showNotice('Exported applications CSV');
              }}
              onOpenAddModal={() => handleOpenAddModal('Saved')}
              isMobileMode={isMobileMode}
            />
          )}

          {activeScreen === 'resumes' && (
            <ResumesScreen
              resumes={resumes}
              applications={applications}
              onAddResume={(input) => {
                const created = addResume(input);
                showNotice(`Saved ${created.label}`);
                return created;
              }}
              onUpdateResume={(id, updates) => {
                updateResume(id, updates);
                showNotice('Updated resume version');
              }}
              onDeleteResume={(id) => {
                deleteResume(id);
                showNotice('Deleted resume version');
              }}
              onFilterByResume={handleFilterByResume}
              isMobileMode={isMobileMode}
            />
          )}

          {activeScreen === 'insights' && (
            <InsightsScreen
              applications={applications}
              resumes={resumes}
              onSelectApplication={(app) => setSelectedAppId(app.id)}
              onExportCSV={() => {
                exportCSV();
                showNotice('Exported applications CSV');
              }}
              onResetDemo={handleResetDemo}
              onClearAll={handleClearAll}
              isMobileMode={isMobileMode}
            />
          )}
        </main>

        {/* Thumb-Zone Bottom Tab Bar in Mobile Mode */}
        {isMobileMode && (
          <BottomTabBar
            activeScreen={activeScreen}
            onNavigate={handleNavigate}
          />
        )}
      </div>

      {/* Slide-Over Application Detail & Round Notes Drawer / Mobile Bottom Sheet */}
      <ApplicationDrawer
        application={selectedApplication}
        resumes={resumes}
        onClose={() => setSelectedAppId(null)}
        onUpdate={updateApplication}
        onMoveStage={handleMoveStage}
        onDelete={(id) => {
          deleteApplication(id);
          showNotice('Deleted application');
        }}
        onDuplicate={(id) => {
          duplicateApplication(id);
          showNotice('Duplicated application');
        }}
        onAddRoundNote={(appId, note) => {
          addRoundNote(appId, note);
          showNotice(`Logged ${note.roundTitle}`);
        }}
        onUpdateRoundNote={updateRoundNote}
        onDeleteRoundNote={deleteRoundNote}
        isMobileMode={isMobileMode}
      />

      {/* Add Application Modal / Mobile Bottom Sheet */}
      <AddApplicationModal
        isOpen={addModalOpen}
        initialStage={addModalStage}
        resumes={resumes}
        onClose={() => setAddModalOpen(false)}
        onAdd={(input) => {
          const created = addApplication(input);
          showNotice(`Added ${created.company} to ${created.stage}`);
        }}
        isMobileMode={isMobileMode}
      />

      {/* Non-intrusive Action Feedback Toast */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed z-50 px-4 py-2.5 bg-[#0f172a] text-white text-xs font-semibold rounded-lg shadow-lg border border-[#1e293b] ${
            isMobileMode
              ? 'bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap'
              : 'bottom-5 right-5'
          }`}
        >
          {notice}
        </div>
      )}
    </div>
  );
}
