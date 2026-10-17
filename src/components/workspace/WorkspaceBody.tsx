import { useState } from "react";
import type { ProblemContent } from "../../data/problems";
import type { ProblemRef } from "../../data/tracks";
import { useMedia } from "../../hooks/useMedia";
import { useApp } from "../../state/AppState";
import { useAssistantWindow } from "../assistant/hooks/useAssistantWindow";
import ConsolePane from "./console/ConsolePane";
import EditorPane from "./editor/EditorPane";
import HeaderActions from "./header/HeaderActions";
import ProblemMeta from "./header/ProblemMeta";
import WorkspaceHeader from "./header/WorkspaceHeader";
import { useCaseDrafts } from "./hooks/useCaseDrafts";
import { useClaudeHandoff } from "./hooks/useClaudeHandoff";
import { useDraft } from "./hooks/useDraft";
import { useRunSession } from "./hooks/useRunSession";
import { useWorkspacePrefs } from "./hooks/useWorkspacePrefs";
import { useWorkspaceShortcuts } from "./hooks/useWorkspaceShortcuts";
import DesktopLayout from "./layout/DesktopLayout";
import MobileLayout, { type MobileTab } from "./layout/MobileLayout";
import LazyAssistant from "./LazyAssistant";
import ProblemPane from "./problem/ProblemPane";

interface WorkspaceBodyProps {
  problemRef: ProblemRef;
  content: ProblemContent;
}

export default function WorkspaceBody({ problemRef, content }: WorkspaceBodyProps) {
  const { state, actions } = useApp();
  const { spec } = content;
  const pid = problemRef.prob.id;
  const progress = state.data.tracks[problemRef.track];
  const done = !!progress.done[pid];
  const accepted = !!progress.accepted[pid];
  const wide = useMedia("(min-width: 900px)");

  const prefs = useWorkspacePrefs();
  const draft = useDraft(pid, spec.starter);
  const caseDrafts = useCaseDrafts(spec);
  const [problemTab, setProblemTab] = useState<"desc" | "solution">("desc");
  const [consoleTab, setConsoleTab] = useState<"cases" | "result">("cases");
  const [mobileTab, setMobileTab] = useState<MobileTab>("problem");

  const session = useRunSession({
    pid,
    content,
    code: draft.code,
    cases: caseDrafts.cases,
    onStart: () => {
      draft.save();
      setConsoleTab("result");
      if (!wide) setMobileTab("tests");
    },
  });
  const assistantWindow = useAssistantWindow();
  const claude = useClaudeHandoff({ content, code: draft.code, run: session.run });
  useWorkspaceShortcuts({
    start: session.start,
    closeWork: actions.closeWork,
    showAssistant: assistantWindow.show,
    hideAssistant: assistantWindow.hide,
  });

  const runCases = () => session.start("run");
  const submit = () => session.start("submit");

  const problemPane = <ProblemPane content={content} tab={problemTab} onTab={setProblemTab} accepted={accepted} fontSize={prefs.font} />;
  const editorPane = (
    <EditorPane
      title={spec.title}
      code={draft.code}
      docKey={draft.docKey}
      onChange={draft.onChange}
      onRun={runCases}
      onSubmit={submit}
      run={session.run}
      fontSize={prefs.font}
      onFontStep={prefs.stepFont}
      onReset={draft.reset}
    />
  );
  const consolePane = (
    <ConsolePane
      spec={spec}
      cases={caseDrafts.cases}
      onCases={caseDrafts.setCases}
      activeCase={caseDrafts.activeCase}
      onActiveCase={caseDrafts.setActiveCase}
      tab={consoleTab}
      onTab={setConsoleTab}
      run={session.run}
    />
  );
  const assistant = (
    <LazyAssistant
      loaded={assistantWindow.loaded}
      open={assistantWindow.open}
      summon={assistantWindow.summon}
      onClose={assistantWindow.hide}
      context={claude.readContext}
      wide={wide}
    />
  );

  return (
    <>
      <WorkspaceHeader
        title={spec.title}
        onClose={actions.closeWork}
        meta={<ProblemMeta spec={spec} problemRef={problemRef} done={done} accepted={accepted} />}
        actions={
          <HeaderActions
            wide={wide}
            asking={assistantWindow.open}
            onAsk={assistantWindow.toggle}
            copied={claude.copied}
            onCopy={claude.copyForClaude}
            busy={session.busy}
            onRun={runCases}
            onStop={session.stop}
            onSubmit={submit}
          />
        }
      />
      {wide ? (
        <DesktopLayout
          splitX={prefs.splitX}
          splitY={prefs.splitY}
          onSplitX={prefs.setSplitX}
          onSplitY={prefs.setSplitY}
          onCommitSplits={prefs.commitSplits}
          problem={problemPane}
          editor={editorPane}
          tests={consolePane}
          assistant={assistant}
        />
      ) : (
        <MobileLayout
          tab={mobileTab}
          onTab={setMobileTab}
          busy={session.busy}
          verdict={session.run?.verdict ?? null}
          problem={problemPane}
          editor={editorPane}
          tests={consolePane}
          assistant={assistant}
        />
      )}
    </>
  );
}
